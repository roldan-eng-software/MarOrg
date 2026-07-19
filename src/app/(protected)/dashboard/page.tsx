"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
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
  aprovado: "bg-green-100 text-green-700",
  enviado: "bg-blue-100 text-blue-700",
  recusado: "bg-red-100 text-red-700",
  em_analise: "bg-yellow-100 text-yellow-700",
  pendente: "bg-yellow-100 text-yellow-700",
  em_producao: "bg-blue-100 text-blue-700",
  acabamento: "bg-purple-100 text-purple-700",
  pronto: "bg-green-100 text-green-700",
  entregue: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

function StatCard({ label, value, subtitle, icon }: { label: string; value: string; subtitle?: string; icon?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <p className="text-xs text-[#8B7A6B]">{label}</p>
        </div>
        <p className="text-xl md:text-2xl font-bold text-[#3D2519] mt-1">{value}</p>
        {subtitle && <p className="text-xs text-[#8B7A6B] mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function BarChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  const max = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 1);

  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((d) => {
        const monthLabel = new Date(d.month + "-01").toLocaleDateString("pt-BR", { month: "short" });
        const revHeight = (d.revenue / max) * 100;
        const expHeight = (d.expenses / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "140px" }}>
              <div
                className="flex-1 rounded-t bg-green-500 min-h-[2px]"
                style={{ height: `${revHeight}%` }}
                title={`Receita: ${formatCurrency(d.revenue)}`}
              />
              <div
                className="flex-1 rounded-t bg-red-400 min-h-[2px]"
                style={{ height: `${expHeight}%` }}
                title={`Despesa: ${formatCurrency(d.expenses)}`}
              />
            </div>
            <span className="text-[10px] text-[#8B7A6B] capitalize">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setMetrics(await getDashboardMetrics());
      } catch {
        showToast("Erro ao carregar dashboard", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-[#8B7A6B]">Carregando dashboard...</div>;
  }

  if (!metrics) {
    return <div className="py-8 text-center text-[#8B7A6B]">Nenhum dado disponível</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Dashboard</h1>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Receita Mensal" value={formatCurrency(metrics.monthlyRevenue)} icon="📈" />
        <StatCard label="Despesas Mensal" value={formatCurrency(metrics.monthlyExpenses)} icon="📉" />
        <StatCard label="Saldo Mensal" value={formatCurrency(metrics.monthlyBalance)} icon="💰"
          subtitle={metrics.monthlyBalance >= 0 ? "Positivo" : "Negativo"} />
        <StatCard label="Clientes" value={String(metrics.totalCustomers)} icon="👥" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Orçamentos" value={String(metrics.totalBudgets)} subtitle={`${metrics.conversionRate}% conversão`} />
        <StatCard label="Ordens de Serviço" value={String(metrics.totalServiceOrders)} />
        <StatCard label="Receita Total" value={formatCurrency(metrics.totalRevenue)} />
        <StatCard label="Despesas Total" value={formatCurrency(metrics.totalExpenses)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#3D2519]">Receita vs Despesas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={metrics.revenueByMonth} />
            <div className="flex gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-xs text-[#8B7A6B]">Receita</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-xs text-[#8B7A6B]">Despesa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#3D2519]">Orçamentos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {metrics.budgetsByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between p-2 rounded border border-[#D4C4B0]">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[s.status] || s.status}
                  </span>
                  <span className="text-sm font-bold text-[#3D2519]">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#3D2519]">Orçamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentBudgets.length === 0 && (
                <p className="text-sm text-[#8B7A6B]">Nenhum orçamento</p>
              )}
              {metrics.recentBudgets.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded border border-[#F5F0EB]">
                  <div>
                    <p className="text-xs font-mono text-[#3D2519]">{b.budget_number}</p>
                    <p className="text-xs text-[#8B7A6B]">{b.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#3D2519]">{formatCurrency(b.total_amount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[#3D2519]">Entregas Previstas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.pendingDeliveries.length === 0 && (
                <p className="text-sm text-[#8B7A6B]">Nenhuma entrega prevista</p>
              )}
              {metrics.pendingDeliveries.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded border border-[#F5F0EB]">
                  <div>
                    <p className="text-xs font-mono text-[#3D2519]">{o.order_number}</p>
                    <p className="text-xs text-[#8B7A6B]">{o.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8B7A6B]">{formatDate(o.estimated_delivery)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[o.status] || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-[#3D2519]">Top Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.topCustomers.length === 0 ? (
            <p className="text-sm text-[#8B7A6B]">Nenhum cliente com orçamentos aprovados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4C4B0]">
                    <th className="text-left py-2 text-xs text-[#8B7A6B]">#</th>
                    <th className="text-left py-2 text-xs text-[#8B7A6B]">Cliente</th>
                    <th className="text-right py-2 text-xs text-[#8B7A6B]">Orçamentos</th>
                    <th className="text-right py-2 text-xs text-[#8B7A6B]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topCustomers.map((c, i) => (
                    <tr key={i} className="border-b border-[#F5F0EB]">
                      <td className="py-2 text-[#8B7A6B]">{i + 1}</td>
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="py-2 text-right">{c.count}</td>
                      <td className="py-2 text-right font-semibold">{formatCurrency(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
