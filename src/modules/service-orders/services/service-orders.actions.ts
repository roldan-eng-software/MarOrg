"use server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceOrder, ServiceOrderItem } from "@/types";

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
      deposit_percentage: budget.deposit_percentage ?? 0,
      installment_count: budget.installment_count ?? 1,
      deposit_value: Number(budget.total_amount) * (Number(budget.deposit_percentage ?? 0) / 100),
      installment_value: (Number(budget.total_amount) - (Number(budget.total_amount) * (Number(budget.deposit_percentage ?? 0) / 100))) / (budget.installment_count ?? 1),
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
      material_id: item.material_id ?? null,
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

    const { data: insertedItems } = await supabase
      .from("service_order_items")
      .insert(items)
      .select("id, material_id");

    // Baixa automática de estoque
    const insertedItemsMap = new Map(insertedItems?.map((it) => [it.material_id, it.id]));

    for (const item of budgetItems) {
      if (!item.material_id || item.item_type !== "mobiliario") continue;

      const { data: material } = await supabase
        .from("materials")
        .select("id, current_stock")
        .eq("id", item.material_id)
        .single();

      if (!material) continue;

      const quantity = Number(item.quantity);
      if (quantity <= 0) continue;

      const newStock = Number(material.current_stock) - quantity;

      await supabase.from("stock_movements").insert({
        material_id: material.id,
        movement_type: "reserva",
        quantity,
        reason: `Reserva automática - OS ${orderNumber}`,
        reference_type: "service_order",
        reference_id: order.id,
        service_order_item_id: insertedItemsMap.get(item.material_id) ?? null,
        created_by: user.id,
      });

      await supabase
        .from("materials")
        .update({ current_stock: newStock })
        .eq("id", material.id);
    }
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

export async function hasFinancialTransactions(osId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("financial_transactions")
    .select("*", { count: "exact", head: true })
    .eq("service_order_id", osId);
  return (count ?? 0) > 0;
}

export async function createFinancialTransactionsFromOS(osId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .select("*, customers(full_name), budgets(budget_number, payment_types)")
    .eq("id", osId)
    .single();

  if (orderError || !order) throw new Error("Ordem de serviço não encontrada");

  const { count: existingCount } = await supabase
    .from("financial_transactions")
    .select("*", { count: "exact", head: true })
    .eq("service_order_id", osId);

  if ((existingCount ?? 0) > 0) {
    throw new Error("Transações financeiras já foram geradas para esta OS");
  }

  const total = Number(order.total_amount);
  const depositPct = Number(order.deposit_percentage ?? 0);
  const installmentCount = order.installment_count ?? 1;
  const depositValue = total * (depositPct / 100);
  const remaining = total - depositValue;
  const installmentValue = remaining / installmentCount;
  const paymentMethod = order.budgets?.payment_types?.[0] ?? null;
  const budgetNumber = order.budgets?.budget_number ?? "";
  const customerName = order.customers?.full_name ?? "";

  const transactions: Array<{
    transaction_type: string;
    category: string;
    description: string;
    amount: number;
    due_date: string;
    status: string;
    entity_type: string;
    entity_id: string;
    service_order_id: string;
    budget_id: string;
    payment_method: string | null;
    notes: string;
    created_by: string;
  }> = [];

  const today = new Date();

  if (depositValue > 0) {
    transactions.push({
      transaction_type: "receita",
      category: "Sinal",
      description: `Sinal - ${budgetNumber} - ${customerName}`,
      amount: depositValue,
      due_date: today.toISOString().split("T")[0],
      status: "pendente",
      entity_type: "service_order",
      entity_id: osId,
      service_order_id: osId,
      budget_id: order.budget_id,
      payment_method: paymentMethod,
      notes: `Sinal de ${depositPct}% referente à OS ${order.order_number}`,
      created_by: user.id,
    });
  }

  for (let i = 0; i < installmentCount; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + i + 1);

    transactions.push({
      transaction_type: "receita",
      category: "Parcela",
      description: `Parcela ${i + 1}/${installmentCount} - ${budgetNumber} - ${customerName}`,
      amount: installmentValue,
      due_date: dueDate.toISOString().split("T")[0],
      status: "pendente",
      entity_type: "service_order",
      entity_id: osId,
      service_order_id: osId,
      budget_id: order.budget_id,
      payment_method: paymentMethod,
      notes: `Parcela ${i + 1} de ${installmentCount} referente à OS ${order.order_number}`,
      created_by: user.id,
    });
  }

  if (transactions.length === 0) {
    throw new Error("Nenhuma transação para gerar. Defina sinal ou parcelas no orçamento.");
  }

  const { error: insertError } = await supabase
    .from("financial_transactions")
    .insert(transactions);

  if (insertError) {
    console.error("Error creating financial transactions:", insertError.message);
    throw new Error("Erro ao criar transações financeiras");
  }

  return { count: transactions.length };
}
