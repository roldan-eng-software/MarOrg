"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  budgetCount: number;
  approvedCount: number;
  averageBudget: number;
  items: {
    budget_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
}

export interface BudgetReport {
  total: number;
  byStatus: { status: string; count: number; total: number }[];
  conversionRate: number;
  averageValue: number;
  items: {
    budget_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    validity_days: number;
  }[];
}

export interface ServiceOrderReport {
  total: number;
  byStatus: { status: string; count: number; total: number }[];
  averageDeliveryDays: number;
  onTimeRate: number;
  items: {
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    estimated_delivery: string | null;
    actual_delivery: string | null;
  }[];
}

export interface InventoryReport {
  totalMaterials: number;
  totalValue: number;
  lowStockCount: number;
  byCategory: { category: string; count: number; value: number }[];
  materials: {
    name: string;
    category: string;
    current_stock: number;
    min_stock: number;
    cost: number;
    unit: string;
  }[];
  recentMovements: {
    material_name: string;
    movement_type: string;
    quantity: number;
    reason: string | null;
    created_at: string;
  }[];
}

export interface CustomerReport {
  totalCustomers: number;
  topCustomers: {
    name: string;
    phone: string;
    total_spent: number;
    budget_count: number;
    last_budget: string;
  }[];
}

export async function getRevenueReport(filters: ReportFilters): Promise<RevenueReport> {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("budget_number, total_amount, status, created_at, customers(full_name)")
    .eq("status", "aprovado")
    .order("created_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate + "T23:59:59");
  }

  const { data: budgets } = await query;

  const items = (budgets || []).map((b) => ({
    budget_number: b.budget_number,
    customer_name: (b.customers as unknown as { full_name: string })?.full_name || "",
    total_amount: Number(b.total_amount),
    status: b.status,
    created_at: b.created_at,
  }));

  const totalRevenue = items.reduce((sum, i) => sum + i.total_amount, 0);
  const budgetCount = items.length;
  const averageBudget = budgetCount > 0 ? totalRevenue / budgetCount : 0;

  const { count: approvedCount } = await supabase
    .from("budgets")
    .select("*", { count: "exact", head: true })
    .eq("status", "aprovado");

  return {
    period: filters.startDate && filters.endDate
      ? `${filters.startDate} a ${filters.endDate}`
      : "Todos os períodos",
    totalRevenue,
    budgetCount,
    approvedCount: approvedCount || 0,
    averageBudget,
    items,
  };
}

export async function getBudgetReport(filters: ReportFilters): Promise<BudgetReport> {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("budget_number, total_amount, status, created_at, validity_days, customers(full_name)")
    .order("created_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate + "T23:59:59");
  }

  const { data: budgets } = await query;

  const items = (budgets || []).map((b) => ({
    budget_number: b.budget_number,
    customer_name: (b.customers as unknown as { full_name: string })?.full_name || "",
    total_amount: Number(b.total_amount),
    status: b.status,
    created_at: b.created_at,
    validity_days: b.validity_days,
  }));

  const total = items.length;
  const statusMap: Record<string, { count: number; total: number }> = {};
  items.forEach((b) => {
    if (!statusMap[b.status]) statusMap[b.status] = { count: 0, total: 0 };
    statusMap[b.status].count++;
    statusMap[b.status].total += b.total_amount;
  });

  const byStatus = Object.entries(statusMap).map(([status, data]) => ({
    status,
    ...data,
  }));

  const sent = items.filter((b) => ["enviado", "em_analise", "aprovado", "recusado"].includes(b.status));
  const approved = items.filter((b) => b.status === "aprovado");
  const conversionRate = sent.length > 0 ? Math.round((approved.length / sent.length) * 100) : 0;
  const averageValue = total > 0 ? items.reduce((s, b) => s + b.total_amount, 0) / total : 0;

  return { total, byStatus, conversionRate, averageValue, items };
}

export async function getServiceOrderReport(filters: ReportFilters): Promise<ServiceOrderReport> {
  const supabase = await createClient();

  let query = supabase
    .from("service_orders")
    .select("order_number, total_amount, status, created_at, estimated_delivery, actual_delivery, customers(full_name)")
    .order("created_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate + "T23:59:59");
  }

  const { data: orders } = await query;

  const items = (orders || []).map((o) => ({
    order_number: o.order_number,
    customer_name: (o.customers as unknown as { full_name: string })?.full_name || "",
    total_amount: Number(o.total_amount),
    status: o.status,
    created_at: o.created_at,
    estimated_delivery: o.estimated_delivery,
    actual_delivery: o.actual_delivery,
  }));

  const total = items.length;
  const statusMap: Record<string, { count: number; total: number }> = {};
  items.forEach((o) => {
    if (!statusMap[o.status]) statusMap[o.status] = { count: 0, total: 0 };
    statusMap[o.status].count++;
    statusMap[o.status].total += o.total_amount;
  });

  const byStatus = Object.entries(statusMap).map(([status, data]) => ({
    status,
    ...data,
  }));

  const delivered = items.filter((o) => o.actual_delivery && o.estimated_delivery);
  let averageDeliveryDays = 0;
  let onTimeCount = 0;
  if (delivered.length > 0) {
    const totalDays = delivered.reduce((sum, o) => {
      const created = new Date(o.created_at);
      const delivered_date = new Date(o.actual_delivery!);
      return sum + Math.ceil((delivered_date.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    averageDeliveryDays = Math.round(totalDays / delivered.length);
    onTimeCount = delivered.filter((o) => new Date(o.actual_delivery!) <= new Date(o.estimated_delivery!)).length;
  }

  const onTimeRate = delivered.length > 0 ? Math.round((onTimeCount / delivered.length) * 100) : 0;

  return { total, byStatus, averageDeliveryDays, onTimeRate, items };
}

export async function getInventoryReport(filters: ReportFilters): Promise<InventoryReport> {
  const supabase = await createClient();

  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("active", true)
    .order("name");

  const mats = materials || [];
  const totalMaterials = mats.length;
  const totalValue = mats.reduce((sum, m) => sum + Number(m.current_stock) * Number(m.cost), 0);
  const lowStockCount = mats.filter((m) => Number(m.current_stock) <= Number(m.min_stock) && Number(m.min_stock) > 0).length;

  const categoryMap: Record<string, { count: number; value: number }> = {};
  mats.forEach((m) => {
    if (!categoryMap[m.category]) categoryMap[m.category] = { count: 0, value: 0 };
    categoryMap[m.category].count++;
    categoryMap[m.category].value += Number(m.current_stock) * Number(m.cost);
  });

  const byCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    ...data,
  }));

  let movementsQuery = supabase
    .from("stock_movements")
    .select("movement_type, quantity, reason, created_at, materials(name)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (filters.startDate) {
    movementsQuery = movementsQuery.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    movementsQuery = movementsQuery.lte("created_at", filters.endDate + "T23:59:59");
  }

  const { data: movements } = await movementsQuery;

  const recentMovements = (movements || []).map((m) => ({
    material_name: (m.materials as unknown as { name: string })?.name || "",
    movement_type: m.movement_type,
    quantity: Number(m.quantity),
    reason: m.reason,
    created_at: m.created_at,
  }));

  return {
    totalMaterials,
    totalValue,
    lowStockCount,
    byCategory,
    materials: mats.map((m) => ({
      name: m.name,
      category: m.category,
      current_stock: Number(m.current_stock),
      min_stock: Number(m.min_stock),
      cost: Number(m.cost),
      unit: m.unit,
    })),
    recentMovements,
  };
}

export async function getCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
  const supabase = await createClient();

  let budgetQuery = supabase
    .from("budgets")
    .select("total_amount, status, created_at, customer_id, customers(full_name, phone)")
    .eq("status", "aprovado");

  if (filters.startDate) {
    budgetQuery = budgetQuery.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    budgetQuery = budgetQuery.lte("created_at", filters.endDate + "T23:59:59");
  }

  const { data: budgets } = await budgetQuery;

  const customerMap: Record<string, { name: string; phone: string; total_spent: number; budget_count: number; last_budget: string }> = {};

  (budgets || []).forEach((b) => {
    const cust = b.customers as unknown as { full_name: string; phone: string } | null;
    if (!cust) return;
    if (!customerMap[b.customer_id]) {
      customerMap[b.customer_id] = {
        name: cust.full_name,
        phone: cust.phone,
        total_spent: 0,
        budget_count: 0,
        last_budget: b.created_at,
      };
    }
    customerMap[b.customer_id].total_spent += Number(b.total_amount);
    customerMap[b.customer_id].budget_count++;
    if (b.created_at > customerMap[b.customer_id].last_budget) {
      customerMap[b.customer_id].last_budget = b.created_at;
    }
  });

  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 20);

  return { totalCustomers: totalCustomers || 0, topCustomers };
}