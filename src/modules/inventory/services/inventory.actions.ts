"use server";

import { createClient } from "@/lib/supabase/server";
import type { Material, StockMovement } from "@/types";

export async function listMaterials(category?: string, search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("materials")
    .select("*")
    .eq("active", true)
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing materials:", error.message);
    return [] as Material[];
  }
  return data as Material[];
}

export async function getMaterial(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Material não encontrado");
  return data as Material;
}

export async function getMaterialMovements(materialId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("material_id", materialId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error listing movements:", error.message);
    return [] as StockMovement[];
  }
  return data as StockMovement[];
}

export async function listAllMovements(limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, materials(name, unit)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error listing movements:", error.message);
    return [];
  }
  return data;
}

export async function createMaterial(data: {
  name: string;
  description?: string;
  category: Material["category"];
  unit: string;
  current_stock: number;
  min_stock: number;
  cost: number;
  supplier?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: material, error } = await supabase
    .from("materials")
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error("Erro ao criar material");

  if (data.current_stock > 0) {
    await supabase.from("stock_movements").insert({
      material_id: material.id,
      movement_type: "entrada",
      quantity: data.current_stock,
      reason: "Estoque inicial",
      created_by: user.id,
    });
  }

  return material as Material;
}

export async function updateMaterial(
  id: string,
  data: Partial<Pick<Material, "name" | "description" | "category" | "unit" | "min_stock" | "cost" | "supplier">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .update(data)
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar material");
  return { id };
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("materials")
    .update({ active: false })
    .eq("id", id);

  if (error) throw new Error("Erro ao excluir material");
  return { id };
}

export async function registerMovement(data: {
  material_id: string;
  movement_type: StockMovement["movement_type"];
  quantity: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { error: movError } = await supabase.from("stock_movements").insert({
    ...data,
    created_by: user.id,
  });

  if (movError) throw new Error("Erro ao registrar movimentação");

  const { data: material } = await supabase
    .from("materials")
    .select("current_stock")
    .eq("id", data.material_id)
    .single();

  if (!material) throw new Error("Material não encontrado");

  let newStock = Number(material.current_stock);
  if (data.movement_type === "entrada" || data.movement_type === "liberacao") {
    newStock += data.quantity;
  } else if (data.movement_type === "saida" || data.movement_type === "reserva") {
    newStock -= data.quantity;
  } else if (data.movement_type === "ajuste") {
    newStock = data.quantity;
  }

  const { error: stockError } = await supabase
    .from("materials")
    .update({ current_stock: newStock })
    .eq("id", data.material_id);

  if (stockError) throw new Error("Erro ao atualizar estoque");

  return { id: data.material_id, new_stock: newStock };
}

export async function getLowStockMaterials() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("active", true)
    .filter("current_stock", "lte", "min_stock")
    .gt("min_stock", 0)
    .order("name");

  if (error) return [] as Material[];
  return data as Material[];
}

export async function getInventoryStats() {
  const supabase = await createClient();

  const { data: materials } = await supabase
    .from("materials")
    .select("current_stock, cost, min_stock")
    .eq("active", true);

  if (!materials) {
    return { totalMaterials: 0, totalValue: 0, lowStockCount: 0, categories: 0 };
  }

  const totalMaterials = materials.length;
  const totalValue = materials.reduce((sum, m) => sum + Number(m.current_stock) * Number(m.cost), 0);
  const lowStockCount = materials.filter((m) => Number(m.current_stock) <= Number(m.min_stock) && Number(m.min_stock) > 0).length;

  const { count: categories } = await supabase
    .from("materials")
    .select("category", { count: "exact", head: true })
    .eq("active", true);

  return { totalMaterials, totalValue, lowStockCount, categories: categories || 0 };
}
