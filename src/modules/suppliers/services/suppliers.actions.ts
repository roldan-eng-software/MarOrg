"use server";

import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";

export interface SupplierWithStats extends Supplier {
  purchase_count: number;
  total_purchases: number;
}

export async function listSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    console.error("Error listing suppliers:", error.message);
    return [];
  }

  return data as Supplier[];
}

export async function getSupplier(id: string): Promise<Supplier> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting supplier:", error.message);
    throw new Error("Fornecedor não encontrado");
  }

  return data as Supplier;
}

export async function createSupplier(
  supplier: Omit<Supplier, "id" | "created_at" | "updated_at" | "created_by">
): Promise<Supplier> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "comercial"].includes(profile.role)) {
    throw new Error("Sem permissão para criar fornecedores");
  }

  const { data, error } = await supabase
    .from("suppliers")
    .insert({ ...supplier, created_by: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating supplier:", error.message);
    throw new Error("Erro ao criar fornecedor");
  }

  return data as Supplier;
}

export async function updateSupplier(
  id: string,
  supplier: Partial<Omit<Supplier, "id" | "created_at" | "updated_at" | "created_by">>
): Promise<{ id: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Sem permissão para atualizar fornecedores");
  }

  const { error } = await supabase
    .from("suppliers")
    .update(supplier)
    .eq("id", id);

  if (error) {
    console.error("Error updating supplier:", error.message);
    throw new Error("Erro ao atualizar fornecedor");
  }

  return { id };
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Sem permissão para excluir fornecedores");
  }

  const { error } = await supabase
    .from("suppliers")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting supplier:", error.message);
    throw new Error("Erro ao excluir fornecedor");
  }
}

export async function generatePurchaseNumber(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from("purchases")
    .select("purchase_number")
    .like("purchase_number", `CMP-${year}-%`)
    .order("purchase_number", { ascending: false })
    .limit(1);

  if (error) {
    return `CMP-${year}-0001`;
  }

  let nextSeq = 1;
  if (data && data.length > 0) {
    const last = data[0].purchase_number;
    const lastSeq = parseInt(last.split("-")[2], 10);
    nextSeq = lastSeq + 1;
  }

  return `CMP-${year}-${String(nextSeq).padStart(4, "0")}`;
}

export async function listPurchases(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("purchases")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing purchases:", error.message);
    return [];
  }

  return (data || []).map((p) => ({
    ...p,
    suppliers: p.suppliers as { name: string } | null,
  }));
}

export async function createPurchase(
  purchase: Omit<{
    id: string;
    purchase_number: string;
    supplier_id: string | null;
    budget_id: string | null;
    description: string;
    total_amount: number;
    status: string;
    due_date: string | null;
    notes: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  }, "id" | "created_at" | "updated_at" | "created_by" | "purchase_number">
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const purchase_number = await generatePurchaseNumber();

  const { data, error } = await supabase
    .from("purchases")
    .insert({ ...purchase, purchase_number, created_by: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase:", error.message);
    throw new Error("Erro ao criar compra");
  }

  return data;
}

export async function updatePurchase(
  id: string,
  purchase: Partial<{
    supplier_id: string | null;
    description: string;
    total_amount: number;
    status: string;
    due_date: string | null;
    notes: string | null;
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("purchases")
    .update(purchase)
    .eq("id", id);

  if (error) {
    console.error("Error updating purchase:", error.message);
    throw new Error("Erro ao atualizar compra");
  }

  return { id };
}
