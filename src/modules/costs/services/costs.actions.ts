"use server";

import { createClient } from "@/lib/supabase/server";
import type { Cost } from "@/types";

export async function listCosts(activeOnly = true) {
  const supabase = await createClient();

  let query = supabase.from("costs").select("*").order("name");

  if (activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing costs:", error.message);
    return [] as Cost[];
  }

  return data as Cost[];
}

export async function getCost(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Custo não encontrado");
  return data as Cost;
}

export async function createCost(data: {
  name: string;
  description?: string;
  cost_type: "fixo" | "variavel";
  default_value: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: cost, error } = await supabase
    .from("costs")
    .insert({
      ...data,
      description: data.description || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error("Erro ao criar custo");
  return cost as Cost;
}

export async function updateCost(
  id: string,
  data: Partial<Pick<Cost, "name" | "description" | "cost_type" | "default_value" | "active">>
) {
  const supabase = await createClient();

  const { error } = await supabase.from("costs").update(data).eq("id", id);

  if (error) throw new Error("Erro ao atualizar custo");
  return { id };
}

export async function deleteCost(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("costs")
    .update({ active: false })
    .eq("id", id);

  if (error) throw new Error("Erro ao desativar custo");
  return { id };
}

export async function getBudgetCosts(budgetId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budget_costs")
    .select("*")
    .eq("budget_id", budgetId)
    .order("created_at");

  if (error) {
    console.error("Error getting budget costs:", error.message);
    return [];
  }

  return data as import("@/types").BudgetCost[];
}

export async function saveBudgetCosts(
  budgetId: string,
  costs: { cost_id: string | null; name: string; cost_type: string | null; value: number; quantity: number }[]
) {
  const supabase = await createClient();

  await supabase.from("budget_costs").delete().eq("budget_id", budgetId);

  if (costs.length > 0) {
    const { error } = await supabase.from("budget_costs").insert(
      costs.map((c) => ({
        budget_id: budgetId,
        cost_id: c.cost_id,
        name: c.name,
        cost_type: c.cost_type,
        value: c.value,
        quantity: c.quantity,
      }))
    );

    if (error) {
      console.error("Error saving budget costs:", error.message);
      throw new Error("Erro ao salvar custos do orçamento");
    }
  }

  return { id: budgetId };
}