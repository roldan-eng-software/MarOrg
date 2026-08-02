"use server";

import { createClient } from "@/lib/supabase/server";
import type { TemplatePart, TemplateCostBreakdown, Material, BudgetRequest } from "@/types";

const emptyBreakdown: TemplateCostBreakdown = {
  mdfCost: 0,
  edgebandCost: 0,
  hardwareCost: 0,
  laborCost: 0,
  totalCost: 0,
  details: { mdfAreaLiquida: 0, mdfAreaComPerda: 0, edgebandPerimeter: 0, hardwareItems: [] },
};

function calculatePartPerimeterMm(width: number, height: number, sides: string[]): number {
  const allSides = sides.includes("all");
  let perimeter = 0;

  if (allSides || sides.includes("top")) perimeter += width;
  if (allSides || sides.includes("bottom")) perimeter += width;
  if (allSides || sides.includes("left")) perimeter += height;
  if (allSides || sides.includes("right")) perimeter += height;

  return perimeter;
}

function computeCostFromParts(
  parts: TemplatePart[],
  materialMap: Map<string, Material>,
  mdfMaterial: Material | null,
  edgebandMaterial: Material | null,
  scaleX: number,
  scaleY: number
): TemplateCostBreakdown {
  let totalMdfAreaLiquidaMm2 = 0;
  let totalEdgebandPerimeterMm = 0;
  let hardwareCost = 0;
  const hardwareItems: { name: string; quantity: number; cost: number }[] = [];

  for (const part of parts) {
    if (part.part_type === "mdf") {
      const w = (part.width_mm || 0) * scaleX;
      const h = (part.height_mm || 0) * scaleY;
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
      hardwareItems.push({ name: part.name, quantity: qty, cost });
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
  const edgebandPerimeterWithMargin = edgebandPerimeterM * 1.10;
  const edgebandPricePerM = edgebandMaterial?.price_per_unit
    ? Number(edgebandMaterial.price_per_unit)
    : edgebandMaterial?.roll_length_mm
      ? Number(edgebandMaterial.cost) / (Number(edgebandMaterial.roll_length_mm) / 1000)
      : 0;
  const edgebandCost = edgebandPerimeterWithMargin * edgebandPricePerM;

  const materialCost = mdfCost + edgebandCost + hardwareCost;

  return {
    mdfCost: parseFloat(mdfCost.toFixed(2)),
    edgebandCost: parseFloat(edgebandCost.toFixed(2)),
    hardwareCost: parseFloat(hardwareCost.toFixed(2)),
    laborCost: 0,
    totalCost: parseFloat((materialCost).toFixed(2)),
    details: {
      mdfAreaLiquida: parseFloat(mdfAreaLiquidaM2.toFixed(3)),
      mdfAreaComPerda: parseFloat(mdfAreaComPerdaM2.toFixed(3)),
      edgebandPerimeter: parseFloat(edgebandPerimeterM.toFixed(3)),
      hardwareItems,
    },
  };
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

export async function calculateTemplateCost(
  templateId: string,
  mdfMaterialId?: string,
  edgebandMaterialId?: string,
  scaleFactors?: { scaleX?: number; scaleY?: number }
): Promise<TemplateCostBreakdown> {
  const supabase = await createClient();

  const { data: parts, error: partsError } = await supabase
    .from("furniture_template_parts")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order");

  if (partsError || !parts || parts.length === 0) {
    return { ...emptyBreakdown };
  }

  const materialIds = new Set<string>();
  parts.forEach((p) => { if (p.material_id) materialIds.add(p.material_id); });
  if (mdfMaterialId) materialIds.add(mdfMaterialId);
  if (edgebandMaterialId) materialIds.add(edgebandMaterialId);

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .in("id", materialIds.size > 0 ? Array.from(materialIds) : ["00000000-0000-0000-0000-000000000000"]);

  const materialMap = new Map<string, Material>();
  (materials || []).forEach((m: Material) => materialMap.set(m.id, m));

  const mdfMaterial = mdfMaterialId ? materialMap.get(mdfMaterialId) ?? null : null;
  const edgebandMaterial = edgebandMaterialId ? materialMap.get(edgebandMaterialId) ?? null : null;
  const scaleX = scaleFactors?.scaleX ?? 1;
  const scaleY = scaleFactors?.scaleY ?? 1;

  return computeCostFromParts(parts as TemplatePart[], materialMap, mdfMaterial, edgebandMaterial, scaleX, scaleY);
}

const FURN_TYPE_TO_TEMPLATE_CATEGORY: Record<string, string> = {
  "Cozinha planejada": "Cozinha",
  "Guarda-roupa": "Quarto",
  "Home office": "Escritorio",
  "Closet": "Quarto",
  "Estante / Rack": "Sala",
  "Outro": "Outro",
};

export async function estimateBudgetRequestCost(
  request: Pick<BudgetRequest, "furniture_type" | "furniture_other" | "width_cm" | "height_cm" | "depth_cm" | "materials">
): Promise<{ breakdown: TemplateCostBreakdown; templateName: string | null }> {
  const supabase = await createClient();

  const category = FURN_TYPE_TO_TEMPLATE_CATEGORY[request.furniture_type] || null;

  const { data: templates } = await supabase
    .from("furniture_templates")
    .select("*")
    .eq("active", true)
    .order("name");

  if (!templates || templates.length === 0) {
    return { breakdown: { ...emptyBreakdown }, templateName: null };
  }

  const furnitureTypeLower = request.furniture_type.toLowerCase();
  const furnitureOther = request.furniture_other?.toLowerCase() || "";

  const matchingTemplates = templates.filter((t: Record<string, unknown>) => {
    const name = (t.name as string).toLowerCase();
    const cat = (t.category as string || "").toLowerCase();

    if (request.furniture_type === "Outro" && furnitureOther) {
      return name.includes(furnitureOther) || furnitureOther.includes(name) || cat === furnitureOther;
    }

    return name.includes(furnitureTypeLower) || cat === (category || "").toLowerCase();
  });

  if (matchingTemplates.length === 0) {
    return { breakdown: { ...emptyBreakdown }, templateName: null };
  }

  if (matchingTemplates.length > 1) {
    const reqWidthCm = request.width_cm || 100;
    matchingTemplates.sort((a, b) => {
      const diffA = Math.abs((Number(a.default_width_cm) || 0) - reqWidthCm);
      const diffB = Math.abs((Number(b.default_width_cm) || 0) - reqWidthCm);
      return diffA - diffB;
    });
  }

  const bestTemplate = matchingTemplates[0];

  const { data: parts } = await supabase
    .from("furniture_template_parts")
    .select("*")
    .eq("template_id", bestTemplate.id)
    .order("sort_order");

  if (!parts || parts.length === 0) {
    return { breakdown: { ...emptyBreakdown }, templateName: bestTemplate.name };
  }

  const materialIds = new Set<string>();
  parts.forEach((p: TemplatePart) => { if (p.material_id) materialIds.add(p.material_id); });

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .in("id", materialIds.size > 0 ? Array.from(materialIds) : ["00000000-0000-0000-0000-000000000000"]);

  const materialMap = new Map<string, Material>();
  (materials || []).forEach((m: Material) => materialMap.set(m.id, m));

  const userMaterials = request.materials?.map((m) => m.toLowerCase()) || [];

  let mdfMaterial: Material | null = null;
  let edgebandMaterial: Material | null = null;

  for (const mat of materialMap.values()) {
    const matchesUser = userMaterials.some(
      (um) => mat.name.toLowerCase().includes(um) || um.includes(mat.name.toLowerCase())
    );

    if (mat.is_sheet && matchesUser && !mdfMaterial) mdfMaterial = mat;
    if (mat.is_edgeband && matchesUser && !edgebandMaterial) edgebandMaterial = mat;
  }

  if (!mdfMaterial) {
    for (const mat of materialMap.values()) {
      if (mat.is_sheet) { mdfMaterial = mat; break; }
    }
  }

  if (!edgebandMaterial) {
    for (const mat of materialMap.values()) {
      if (mat.is_edgeband) { edgebandMaterial = mat; break; }
    }
  }

  const templateWidthCm = bestTemplate.default_width_cm;
  const templateHeightCm = bestTemplate.default_height_cm;
  const scaleX = templateWidthCm && request.width_cm
    ? request.width_cm / templateWidthCm
    : 1;
  const scaleY = templateHeightCm && request.height_cm
    ? request.height_cm / templateHeightCm
    : 1;

  const breakdown = computeCostFromParts(
    parts as TemplatePart[],
    materialMap,
    mdfMaterial,
    edgebandMaterial,
    scaleX,
    scaleY
  );

  return { breakdown, templateName: bestTemplate.name };
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