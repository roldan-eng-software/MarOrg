"use server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceOrder, ServiceOrderItem, Budget } from "@/types";

async function generateOrderNumber(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { count } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true });

  const num = (count || 0) + 1;
  const year = new Date().getFullYear();
  return `OS-${year}-${String(num).padStart(4, "0")}`;
}

export async function listServiceOrders(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("service_orders")
    .select("*, customers(full_name, phone)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error listing service orders:", error.message);
    return [] as (ServiceOrder & { customers: { full_name: string; phone: string } })[];
  }
  return data;
}

export async function getServiceOrder(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_orders")
    .select("*, customers(*), budgets(budget_number, notes_client)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Ordem de serviço não encontrada");
  }

  const { data: items } = await supabase
    .from("service_order_items")
    .select("*")
    .eq("service_order_id", id)
    .order("sort_order");

  return {
    ...data,
    items: items || [],
  } as ServiceOrder & {
    customers: import("@/types").Customer;
    budgets: { budget_number: string; notes_client: string | null };
    items: ServiceOrderItem[];
  };
}

export async function createServiceOrderFromBudget(budgetId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*, customers(full_name)")
    .eq("id", budgetId)
    .single();

  if (budgetError || !budget) throw new Error("Orçamento não encontrado");

  const { count } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true });

  const year = new Date().getFullYear();
  const orderNumber = `OS-${year}-${String((count || 0) + 1).padStart(4, "0")}`;

  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .insert({
      order_number: orderNumber,
      budget_id: budgetId,
      customer_id: budget.customer_id,
      status: "pendente",
      priority: "normal",
      total_amount: budget.total_amount,
      notes_internal: budget.notes_client,
      created_by: user.id,
    })
    .select()
    .single();

  if (orderError) throw new Error("Erro ao criar ordem de serviço");

  const { data: budgetItems } = await supabase
    .from("budget_items")
    .select("*")
    .eq("budget_id", budgetId)
    .order("sort_order");

  if (budgetItems && budgetItems.length > 0) {
    const items = budgetItems.map((item, i) => ({
      service_order_id: order.id,
      budget_item_id: item.id,
      item_type: item.item_type,
      description: item.description,
      material: item.material,
      width_cm: item.width_cm,
      depth_cm: item.depth_cm,
      height_cm: item.height_cm,
      finish: item.finish,
      unit: item.unit,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      notes: item.notes,
      sort_order: i,
    }));

    await supabase.from("service_order_items").insert(items);
  }

  return order as ServiceOrder;
}

export async function updateServiceOrder(
  id: string,
  data: Partial<Pick<ServiceOrder, "status" | "priority" | "start_date" | "estimated_delivery" | "actual_delivery" | "responsible" | "notes_internal" | "notes_production">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("service_orders")
    .update(data)
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar ordem de serviço");

  return { id };
}

export async function updateServiceOrderStatus(
  id: string,
  status: ServiceOrder["status"]
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };

  if (status === "entregue") {
    updateData.actual_delivery = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("service_orders")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar status");

  return { id };
}

export async function deleteServiceOrder(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("service_orders")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Erro ao excluir ordem de serviço");

  return { id };
}
