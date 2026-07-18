"use server";

import { createClient } from "@/lib/supabase/server";

export interface FinancialFilters {
  startDate?: string;
  endDate?: string;
  type?: "receita" | "despesa";
  status?: string;
  category?: string;
}

export interface FinancialSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPendentes: number;
  despesasPendentes: number;
  receitasAtrasadas: number;
  despesasAtrasadas: number;
  byCategory: { category: string; total: number; count: number }[];
}

export interface FinancialTransaction {
  id: string;
  transaction_type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  entity_type: string | null;
  entity_id: string | null;
  supplier_id: string | null;
  budget_id: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  suppliers?: { name: string } | null;
}

export async function getFinancialSummary(filters: FinancialFilters): Promise<FinancialSummary> {
  const supabase = await createClient();

  let query = supabase
    .from("financial_transactions")
    .select("transaction_type, category, amount, status, due_date");

  if (filters.startDate) {
    query = query.gte("due_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("due_date", filters.endDate);
  }

  const { data: transactions } = await query;

  const items = transactions || [];

  const totalReceitas = items
    .filter((t) => t.transaction_type === "receita" && t.status !== "cancelado")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDespesas = items
    .filter((t) => t.transaction_type === "despesa" && t.status !== "cancelado")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const receitasPendentes = items
    .filter((t) => t.transaction_type === "receita" && t.status === "pendente")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const despesasPendentes = items
    .filter((t) => t.transaction_type === "despesa" && t.status === "pendente")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const receitasAtrasadas = items
    .filter((t) => t.transaction_type === "receita" && t.status === "atrasado")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const despesasAtrasadas = items
    .filter((t) => t.transaction_type === "despesa" && t.status === "atrasado")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap: Record<string, { total: number; count: number }> = {};
  items.forEach((t) => {
    if (t.status === "cancelado") return;
    if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, count: 0 };
    categoryMap[t.category].total += Number(t.amount);
    categoryMap[t.category].count++;
  });

  const byCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    ...data,
  }));

  return {
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    receitasPendentes,
    despesasPendentes,
    receitasAtrasadas,
    despesasAtrasadas,
    byCategory,
  };
}

export async function listTransactions(filters: FinancialFilters): Promise<FinancialTransaction[]> {
  const supabase = await createClient();

  let query = supabase
    .from("financial_transactions")
    .select("*, suppliers(name)")
    .order("due_date", { ascending: false });

  if (filters.startDate) {
    query = query.gte("due_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("due_date", filters.endDate);
  }
  if (filters.type) {
    query = query.eq("transaction_type", filters.type);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing transactions:", error.message);
    return [];
  }

  return (data || []).map((t) => ({
    ...t,
    amount: Number(t.amount),
    suppliers: t.suppliers as { name: string } | null,
  })) as FinancialTransaction[];
}

export async function createTransaction(
  transaction: Omit<FinancialTransaction, "id" | "created_at" | "suppliers"> & {
    created_by?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("financial_transactions")
    .insert({ ...transaction, created_by: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error.message);
    throw new Error("Erro ao criar transação");
  }

  return data;
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Omit<FinancialTransaction, "id" | "created_at" | "suppliers">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("financial_transactions")
    .update(transaction)
    .eq("id", id);

  if (error) {
    console.error("Error updating transaction:", error.message);
    throw new Error("Erro ao atualizar transação");
  }

  return { id };
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("financial_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error.message);
    throw new Error("Erro ao excluir transação");
  }
}
