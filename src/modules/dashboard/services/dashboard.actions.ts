"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  totalCustomers: number;
  totalBudgets: number;
  budgetsByStatus: { status: string; count: number }[];
  totalServiceOrders: number;
  serviceOrdersByStatus: { status: string; count: number }[];
  monthlyRevenue: number;
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  conversionRate: number;
  topCustomers: { name: string; total: number; count: number }[];
  recentBudgets: {
    id: string;
    budget_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
  pendingDeliveries: {
    id: string;
    order_number: string;
    customer_name: string;
    estimated_delivery: string;
    status: string;
  }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const [
    customersResult,
    budgetsResult,
    serviceOrdersResult,
    revenueResult,
    recentBudgetsResult,
    pendingDeliveriesResult,
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("budgets").select("status, total_amount, created_at"),
    supabase.from("service_orders").select("status, total_amount, created_at"),
    supabase.from("budgets").select("total_amount, status, created_at"),
    supabase
      .from("budgets")
      .select("id, budget_number, total_amount, status, created_at, customers(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("service_orders")
      .select("id, order_number, estimated_delivery, status, customers(full_name)")
      .in("status", ["pendente", "em_producao", "acabamento", "pronto"])
      .not("estimated_delivery", "is", null)
      .order("estimated_delivery", { ascending: true })
      .limit(5),
  ]);

  const budgets = budgetsResult.data || [];
  const serviceOrders = serviceOrdersResult.data || [];
  const allRevenue = revenueResult.data || [];

  const totalCustomers = customersResult.count || 0;

  const budgetsByStatus = Object.entries(
    budgets.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const serviceOrdersByStatus = Object.entries(
    serviceOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const approvedBudgets = budgets.filter((b) => b.status === "aprovado");
  const sentBudgets = budgets.filter((b) =>
    ["enviado", "em_analise", "aprovado", "recusado"].includes(b.status)
  );
  const conversionRate =
    sentBudgets.length > 0
      ? Math.round((approvedBudgets.length / sentBudgets.length) * 100)
      : 0;

  const totalRevenue = allRevenue
    .filter((b) => b.status === "aprovado")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const now = new Date();
  const monthlyRevenue = allRevenue
    .filter((b) => {
      const d = new Date(b.created_at);
      return (
        b.status === "aprovado" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const revenueByMonthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonthMap[key] = 0;
  }
  allRevenue
    .filter((b) => b.status === "aprovado")
    .forEach((b) => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in revenueByMonthMap) {
        revenueByMonthMap[key] += Number(b.total_amount);
      }
    });
  const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  const topCustomersResult = await supabase
    .from("budgets")
    .select("total_amount, customer_id, customers(full_name)")
    .eq("status", "aprovado");

  const topCustomersMap: Record<string, { name: string; total: number; count: number }> = {};
  (topCustomersResult.data || []).forEach((b: Record<string, unknown>) => {
    const cust = b.customers as { full_name: string } | null;
    const custId = b.customer_id as string;
    const amount = Number(b.total_amount);
    if (cust && custId) {
      if (!topCustomersMap[custId]) {
        topCustomersMap[custId] = { name: cust.full_name, total: 0, count: 0 };
      }
      topCustomersMap[custId].total += amount;
      topCustomersMap[custId].count += 1;
    }
  });
  const topCustomers = Object.values(topCustomersMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recentBudgets = (recentBudgetsResult.data || []).map((b) => ({
    id: b.id,
    budget_number: b.budget_number,
    customer_name: (b.customers as unknown as { full_name: string })?.full_name || "",
    total_amount: b.total_amount,
    status: b.status,
    created_at: b.created_at,
  }));

  const pendingDeliveries = (pendingDeliveriesResult.data || []).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    customer_name: (o.customers as unknown as { full_name: string })?.full_name || "",
    estimated_delivery: o.estimated_delivery,
    status: o.status,
  }));

  return {
    totalCustomers,
    totalBudgets: budgets.length,
    budgetsByStatus,
    totalServiceOrders: serviceOrders.length,
    serviceOrdersByStatus,
    monthlyRevenue,
    totalRevenue,
    revenueByMonth,
    conversionRate,
    topCustomers,
    recentBudgets,
    pendingDeliveries,
  };
}
