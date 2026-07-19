"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  totalCustomers: number;
  totalBudgets: number;
  budgetsByStatus: { status: string; count: number }[];
  totalServiceOrders: number;
  serviceOrdersByStatus: { status: string; count: number }[];
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
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

  const now = new Date();
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const currentMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const [
    customersResult,
    budgetsResult,
    serviceOrdersResult,
    transactionsResult,
    recentBudgetsResult,
    pendingDeliveriesResult,
  ] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("budgets").select("status, total_amount, created_at"),
    supabase.from("service_orders").select("status, total_amount, created_at"),
    supabase
      .from("financial_transactions")
      .select("transaction_type, amount, status, due_date")
      .in("status", ["pendente", "pago", "atrasado"]),
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
  const transactions = transactionsResult.data || [];

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

  const totalRevenue = transactions
    .filter((t) => t.transaction_type === "receita" && t.status === "pago")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.transaction_type === "despesa" && t.status === "pago")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyRevenue = transactions
    .filter((t) => {
      const d = new Date(t.due_date);
      return (
        t.transaction_type === "receita" &&
        t.status === "pago" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpenses = transactions
    .filter((t) => {
      const d = new Date(t.due_date);
      return (
        t.transaction_type === "despesa" &&
        t.status === "pago" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyBalance = monthlyRevenue - monthlyExpenses;

  const revenueByMonthMap: Record<string, { revenue: number; expenses: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonthMap[key] = { revenue: 0, expenses: 0 };
  }
  transactions.forEach((t) => {
    const d = new Date(t.due_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in revenueByMonthMap && t.status === "pago") {
      if (t.transaction_type === "receita") {
        revenueByMonthMap[key].revenue += Number(t.amount);
      } else if (t.transaction_type === "despesa") {
        revenueByMonthMap[key].expenses += Number(t.amount);
      }
    }
  });
  const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, data]) => ({
    month,
    ...data,
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
    monthlyExpenses,
    monthlyBalance,
    totalRevenue,
    totalExpenses,
    revenueByMonth,
    conversionRate,
    topCustomers,
    recentBudgets,
    pendingDeliveries,
  };
}
