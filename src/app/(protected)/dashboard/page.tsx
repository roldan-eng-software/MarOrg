"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getDashboardMetrics,
  type DashboardMetrics,
} from "@/modules/dashboard/services/dashboard.actions";

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  vencido: "Vencido",
  revisado: "Revisado",
  pendente: "Pendente",
  em_producao: "Em Produção",
  acabamento: "Acabamento",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  enviado: "bg-blue-100 text-blue-700",
  em_analise: "bg-yellow-100 text-yellow-700",
  aprovado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
  vencido: "bg-red-100 text-red-700",
  revisado: "bg-blue-100 text-blue-700",
  pendente: "bg-yellow-100 text-yellow-700",
  em_producao: "bg-blue-100 text-blue-700",
  acabamento: "bg-purple-100 text-purple-700",
  pronto: "bg-green-100 text-green-700",
  entregue: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#8B7A6B] uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#3D2519]">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-[#8B7A6B]">{subtitle}</p>
            )}
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
}) {
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-[#8B7A6B] mb-1">
              {item.value > 0
                ? item.value >= 1000
                  ? `${(item.value / 1000).toFixed(1)}k`
                  : item.value.toFixed(0)
                : ""}
            </span>
            <div
              className="w-full bg-[#5B3A29] rounded-t min-h-[2px] transition-all"
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <span className="text-[10px] text-[#8B7A6B] mt-1">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const width = (item.value / maxValue) * 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#3D2519]">{item.label}</span>
              <span className="text-xs font-medium text-[#3D2519]">
                {item.value}
              </span>
            </div>
            <div className="h-2 bg-[#F5F0EB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  if (!metrics) {
    return (
      <p className="py-8 text-center text-red-500">
        Erro ao carregar métricas
      </p>
    );
  }

  const maxRevenue = Math.max(...metrics.revenueByMonth.map((r) => r.revenue));

  const budgetStatusData = metrics.budgetsByStatus.map((b) => ({
    label: statusLabels[b.status] || b.status,
    value: b.count,
    color:
      b.status === "aprovado"
        ? "bg-green-500"
        : b.status === "enviado"
          ? "bg-blue-500"
          : b.status === "recusado"
            ? "bg-red-500"
            : b.status === "em_analise"
              ? "bg-yellow-500"
              : "bg-gray-400",
  }));

  const osStatusData = metrics.serviceOrdersByStatus.map((o) => ({
    label: statusLabels[o.status] || o.status,
    value: o.count,
    color:
      o.status === "pronto"
        ? "bg-green-500"
        : o.status === "em_producao"
          ? "bg-blue-500"
          : o.status === "acabamento"
            ? "bg-purple-500"
            : o.status === "entregue"
              ? "bg-emerald-500"
              : "bg-gray-400",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Clientes"
          value={metrics.totalCustomers.toString()}
          icon="👥"
        />
        <MetricCard
          title="Orçamentos"
          value={metrics.totalBudgets.toString()}
          subtitle={`${metrics.conversionRate}% conversão`}
          icon="📋"
        />
        <MetricCard
          title="Ordens de Serviço"
          value={metrics.totalServiceOrders.toString()}
          icon="🔧"
        />
        <MetricCard
          title="Faturamento Mensal"
          value={formatCurrency(metrics.monthlyRevenue)}
          subtitle={`Total: ${formatCurrency(metrics.totalRevenue)}`}
          icon="💰"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={metrics.revenueByMonth.map((r) => {
                const [year, month] = r.month.split("-");
                return {
                  label: monthNames[parseInt(month) - 1],
                  value: r.revenue,
                };
              })}
              maxValue={maxRevenue}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamentos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetStatusData.length > 0 ? (
              <HorizontalBarChart data={budgetStatusData} />
            ) : (
              <p className="text-sm text-[#8B7A6B]">Nenhum orçamento</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>OS por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {osStatusData.length > 0 ? (
              <HorizontalBarChart data={osStatusData} />
            ) : (
              <p className="text-sm text-[#8B7A6B]">Nenhuma ordem de serviço</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topCustomers.length > 0 ? (
              <div className="space-y-3">
                {metrics.topCustomers.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-[#F5F0EB] pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#3D2519]">
                        {c.name}
                      </p>
                      <p className="text-xs text-[#8B7A6B]">
                        {c.count} orçamento{c.count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#3D2519]">
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8B7A6B]">Nenhum cliente</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orçamentos Recentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/budgets")}
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {metrics.recentBudgets.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentBudgets.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between border-b border-[#F5F0EB] pb-2 last:border-0 cursor-pointer hover:bg-[#F5F0EB] -mx-2 px-2 rounded"
                    onClick={() => router.push(`/budgets/${b.id}/edit`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#3D2519]">
                        {b.budget_number}
                      </p>
                      <p className="text-xs text-[#8B7A6B]">
                        {b.customer_name} • {formatDate(b.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabels[b.status] || b.status}
                      </span>
                      <span className="text-sm font-semibold text-[#3D2519]">
                        {formatCurrency(b.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8B7A6B]">Nenhum orçamento</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas Entregas</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/service-orders")}
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {metrics.pendingDeliveries.length > 0 ? (
              <div className="space-y-3">
                {metrics.pendingDeliveries.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between border-b border-[#F5F0EB] pb-2 last:border-0 cursor-pointer hover:bg-[#F5F0EB] -mx-2 px-2 rounded"
                    onClick={() => router.push(`/service-orders/${o.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#3D2519]">
                        {o.order_number}
                      </p>
                      <p className="text-xs text-[#8B7A6B]">
                        {o.customer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabels[o.status] || o.status}
                      </span>
                      <span className="text-xs text-[#8B7A6B]">
                        {formatDate(o.estimated_delivery)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8B7A6B]">Nenhuma entrega pendente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
