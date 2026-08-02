"use server";

import { createClient } from "@/lib/supabase/server";
import type { TemplatePart, TemplateCostBreakdown, Material } from "@/types";

interface TemplatePartWithMaterial extends TemplatePart {
  material?: Material | null;
}

export async function getTemplateParts(templateId: string): Promise<TemplatePart[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("furniture_template_parts")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order");

  if (error) {
    console.error("Error fetching template parts:", error.message);
    return [];
  }

  return (data || []) as TemplatePart[];
}

function mm2ToM2(mm: number): number {
  return mm / 1000;
}

function calculatePartPerimeterMm(width: number, height: number, sides: string[]): number {
  const allSides = sides.includes("all");
  let perimeter = 0;

  if (allSides || sides.includes("top")) perimeter += width;
  if (allSides || sides.includes("bottom")) perimeter += width;
  if (allSides || sides.includes("left")) perimeter += height;
  if (allSides || sides.includes("right")) perimeter += height;

  return perimeter;
}

export async function calculateTemplateCost(
  templateId: string,
  mdfMaterialId?: string,
  edgebandMaterialId?: string
): Promise<TemplateCostBreakdown> {
  const supabase = await createClient();

  const { data: parts, error: partsError } = await supabase
    .from("furniture_template_parts")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order");

  if (partsError || !parts) {
    return {
      mdfCost: 0,
      edgebandCost: 0,
      hardwareCost: 0,
      laborCost: 0,
      totalCost: 0,
      details: { mdfAreaLiquida: 0, mdfAreaComPerda: 0, edgebandPerimeter: 0, hardwareItems: [] },
    };
  }

  const materialIds = new Set<string>();
  parts.forEach((p: TemplatePart) => {
    if (p.material_id) materialIds.add(p.material_id);
  });
  if (mdfMaterialId) materialIds.add(mdfMaterialId);
  if (edgebandMaterialId) materialIds.add(edgebandMaterialId);

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .in("id", materialIds.size > 0 ? Array.from(materialIds) : ["00000000-0000-0000-0000-000000000000"]);

  const materialMap = new Map<string, Material>();
  (materials || []).forEach((m: Material) => materialMap.set(m.id, m));

  const mdfMaterial = mdfMaterialId ? materialMap.get(mdfMaterialId) : null;
  const edgebandMaterial = edgebandMaterialId ? materialMap.get(edgebandMaterialId) : null;

  let totalMdfAreaLiquidaMm2 = 0;
  let totalEdgebandPerimeterMm = 0;
  let hardwareCost = 0;
  const hardwareItems: { name: string; quantity: number; cost: number }[] = [];

  for (const part of parts as TemplatePart[]) {
    if (part.part_type === "mdf") {
      const w = part.width_mm || 0;
      const h = part.height_mm || 0;
      const qty = part.quantity || 1;

      totalMdfAreaLiquidaMm2 += w * h * qty;

      if (part.has_edgeband && part.edgeband_sides) {
        const sides = Array.isArray(part.edgeband_sides)
          ? part.edgeband_sides
          : [];
        totalEdgebandPerimeterMm += calculatePartPerimeterMm(w, h, sides) * qty;
      }
    }

    if (part.part_type === "ferragem") {
      const mat = part.material_id ? materialMap.get(part.material_id) : null;
      const qty = part.quantity || 1;
      const cost = mat ? mat.cost * qty : 0;
      hardwareCost += cost;
      hardwareItems.push({
        name: part.name,
        quantity: qty,
        cost,
      });
    }

    if (part.part_type === "mao_obra") {
      const mat = part.material_id ? materialMap.get(part.material_id) : null;
      hardwareCost += (mat?.cost || 0) * (part.quantity || 1);
    }
  }

  const mdfAreaLiquidaM2 = totalMdfAreaLiquidaMm2 / 1000000;

  const wastePercent = mdfMaterial ? (mdfMaterial.waste_percent ?? 15) : 15;
  const mdfAreaComPerdaM2 = mdfAreaLiquidaM2 * (1 + wastePercent / 100);

  const pricePerM2 = mdfMaterial?.price_per_unit
    ? Number(mdfMaterial.price_per_unit)
    : mdfMaterial?.sheet_width_mm && mdfMaterial?.sheet_height_mm
      ? Number(mdfMaterial.cost) / ((Number(mdfMaterial.sheet_width_mm) * Number(mdfMaterial.sheet_height_mm)) / 1000000)
      : 0;

  const mdfCost = mdfAreaComPerdaM2 * pricePerM2;

  const edgebandPerimeterM = totalEdgebandPerimeterMm / 1000;
  const edgebandMargin = 1.10;
  const edgebandPerimeterWithMargin = edgebandPerimeterM * edgebandMargin;
  const edgebandPricePerM = edgebandMaterial?.price_per_unit
    ? Number(edgebandMaterial.price_per_unit)
    : edgebandMaterial?.roll_length_mm
      ? Number(edgebandMaterial.cost) / (Number(edgebandMaterial.roll_length_mm) / 1000)
      : 0;
  const edgebandCost = edgebandPerimeterWithMargin * edgebandPricePerM;

  const materialCost = mdfCost + edgebandCost + hardwareCost;
  const laborCost = 0;

  return {
    mdfCost: parseFloat(mdfCost.toFixed(2)),
    edgebandCost: parseFloat(edgebandCost.toFixed(2)),
    hardwareCost: parseFloat(hardwareCost.toFixed(2)),
    laborCost: parseFloat(laborCost.toFixed(2)),
    totalCost: parseFloat((materialCost + laborCost).toFixed(2)),
    details: {
      mdfAreaLiquida: parseFloat(mdfAreaLiquidaM2.toFixed(3)),
      mdfAreaComPerda: parseFloat(mdfAreaComPerdaM2.toFixed(3)),
      edgebandPerimeter: parseFloat(edgebandPerimeterM.toFixed(3)),
      hardwareItems,
    },
  };
}

export async function saveTemplateParts(
  templateId: string,
  parts: Omit<TemplatePart, "id" | "template_id" | "created_at">[]
) {
  const supabase = await createClient();

  await supabase.from("furniture_template_parts").delete().eq("template_id", templateId);

  if (parts.length === 0) return;

  const inserts = parts.map((p, idx) => ({
    template_id: templateId,
    part_type: p.part_type,
    material_id: p.material_id || null,
    name: p.name,
    width_mm: p.width_mm || null,
    height_mm: p.height_mm || null,
    depth_mm: p.depth_mm || null,
    quantity: p.quantity || 1,
    has_edgeband: p.has_edgeband || false,
    edgeband_sides: p.edgeband_sides || ["all"],
    sort_order: idx,
  }));

  const { error } = await supabase.from("furniture_template_parts").insert(inserts);

  if (error) {
    console.error("Error saving template parts:", error.message);
    throw new Error("Erro ao salvar composição do template");
  }
}