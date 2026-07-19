"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Budget, BudgetItem } from "@/types";

export async function generateBudgetNumber(): Promise<string> {
  const supabase = createAdminClient();
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from("budgets")
    .select("budget_number")
    .like("budget_number", `ORC-${year}-%`)
    .order("budget_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error generating budget number:", error.message);
    return `ORC-${year}-0001`;
  }

  let nextSeq = 1;
  if (data && data.length > 0) {
    const last = data[0].budget_number;
    const lastSeq = parseInt(last.split("-")[2], 10);
    nextSeq = lastSeq + 1;
  }

  return `ORC-${year}-${String(nextSeq).padStart(4, "0")}`;
}

export async function listBudgets(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("*, customers(full_name, phone)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing budgets:", error.message);
    return [] as (Budget & { customers: { full_name: string; phone: string } })[];
  }
  return data as (Budget & { customers: { full_name: string; phone: string } })[];
}

export async function getBudget(id: string) {
  const supabase = await createClient();

  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*, customers(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting budget:", error.message);
    throw new Error("Orçamento não encontrado");
  }

  const { data: items, error: itemsError } = await supabase
    .from("budget_items")
    .select("*")
    .eq("budget_id", id)
    .order("sort_order");

  if (itemsError) {
    console.error("Error getting budget items:", itemsError.message);
    throw new Error("Erro ao carregar itens do orçamento");
  }

  return {
    ...budget,
    items: items as BudgetItem[],
    customers: budget.customers as Record<string, unknown>,
  };
}

export async function createBudget(
  budget: Omit<Budget, "id" | "created_at" | "updated_at" | "total_amount" | "budget_number" | "version" | "sent_at" | "approved_at" | "refused_at"> & {
    payment_conditions?: string | null;
    payment_installments?: Budget["payment_installments"];
    payment_types?: string[];
    deposit_percentage?: number;
    installment_count?: number;
  },
  items: Omit<BudgetItem, "id" | "created_at" | "budget_id">[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const budget_number = await generateBudgetNumber();

  const { data: newBudget, error } = await supabase
    .from("budgets")
    .insert({
      ...budget,
      payment_conditions: budget.payment_conditions ?? null,
      payment_installments: budget.payment_installments ?? [],
      payment_types: budget.payment_types ?? [],
      deposit_percentage: budget.deposit_percentage ?? 0,
      installment_count: budget.installment_count ?? 1,
      budget_number,
      version: 1,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating budget:", error.message);
    throw new Error("Erro ao criar orçamento");
  }

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("budget_items").insert(
      items.map((item, i) => ({
        ...item,
        budget_id: newBudget.id,
        sort_order: i,
      }))
    );
    if (itemsError) {
      console.error("Error creating budget items:", itemsError.message);
      throw new Error("Erro ao criar itens do orçamento");
    }
  }

  return newBudget as Budget;
}

export async function updateBudget(
  id: string,
  budget: Partial<Omit<Budget, "id" | "created_at" | "updated_at">> & {
    payment_conditions?: string | null;
    payment_installments?: Budget["payment_installments"];
    payment_types?: string[];
    deposit_percentage?: number;
    installment_count?: number;
  },
  items?: (Omit<BudgetItem, "id" | "created_at" | "budget_id"> & { id?: string })[]
) {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("budgets")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching budget:", fetchError.message);
    throw new Error("Orçamento não encontrado");
  }
  if (["aprovado", "recusado", "vencido"].includes(existing.status)) {
    throw new Error("Não é possível editar orçamento com status final");
  }

  const { error } = await supabase
    .from("budgets")
    .update(budget)
    .eq("id", id);

  if (error) {
    console.error("Error updating budget:", error.message);
    throw new Error("Erro ao atualizar orçamento");
  }

  if (items) {
    await supabase.from("budget_items").delete().eq("budget_id", id);

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("budget_items")
        .insert(
          items.map((item, i) => ({
            ...item,
            ...(item.id ? { id: item.id } : {}),
            budget_id: id,
            sort_order: i,
          }))
        );
      if (itemsError) {
        console.error("Error updating budget items:", itemsError.message);
        throw new Error("Erro ao atualizar itens do orçamento");
      }
    }
  }

  return { id };
}

export async function updateBudgetStatus(
  id: string,
  status: Budget["status"]
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };

  if (status === "enviado") updateData.sent_at = new Date().toISOString();
  if (status === "aprovado") updateData.approved_at = new Date().toISOString();
  if (status === "recusado") updateData.refused_at = new Date().toISOString();

  const { error } = await supabase
    .from("budgets")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating budget status:", error.message);
    throw new Error("Erro ao atualizar status do orçamento");
  }
}
