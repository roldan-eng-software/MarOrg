"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getRevenueReport,
  getBudgetReport,
  getServiceOrderReport,
  getInventoryReport,
  getCustomerReport,
  type RevenueReport,
  type BudgetReport,
  type ServiceOrderReport,
  type InventoryReport,
  type CustomerReport,
} from "@/modules/reports/services/reports.actions";

type ReportType = "revenue" | "budgets" | "orders" | "inventory" | "customers";

const tabs: { key: ReportType; label: string }[] = [
  { key: "revenue", label: "Faturamento" },
  { key: "budgets", label: "Orçamentos" },
  { key: "orders", label: "Ordens de Serviço" },
  { key: "inventory", label: "Estoque" },
  { key: "customers", label: "Clientes" },
];

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

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-[#8B7A6B]">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-[#3D2519]">{value}</p>
        {subtitle && <p className="text-xs text-[#8B7A6B] mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("revenue");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetReport | null>(null);
  const [orderData, setOrderData] = useState<ServiceOrderReport | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(null);
  const [customerData, setCustomerData] = useState<CustomerReport | null>(null);

  async function loadReport(type: ReportType) {
    try {
      setLoading(true);
      const filters = { startDate: startDate || undefined, endDate: endDate || undefined };

      switch (type) {
        case "revenue":
          setRevenueData(await getRevenueReport(filters));
          break;
        case "budgets":
          setBudgetData(await getBudgetReport(filters));
          break;
        case "orders":
          setOrderData(await getServiceOrderReport(filters));
          break;
        case "inventory":
          setInventoryData(await getInventoryReport(filters));
          break;
        case "customers":
          setCustomerData(await getCustomerReport(filters));
          break;
      }
    } catch {
      showToast("Erro ao carregar relatório", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: ReportType) {
    setActiveTab(tab);
    loadReport(tab);
  }

  async function handleExportPdf() {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const url = `/api/reports/${activeTab}?${params.toString()}`;
      window.open(url, "_blank");
    } catch {
      showToast("Erro ao exportar PDF", "error");
    }
  }

  useState(() => {
    loadReport("revenue");
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Relatórios</h1>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <Input id="startDate" label="Data Início" type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)} />
            <Input id="endDate" label="Data Fim" type="date" value={endDate}
              onChange={(e) => setEndDate(e.target.value)} />
            <Button onClick={() => loadReport(activeTab)} disabled={loading}>
              {loading ? "Carregando..." : "Filtrar"}
            </Button>
            <Button onClick={handleExportPdf} disabled={loading} variant="secondary">
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleTabChange(tab.key)}
            className="whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading && <p className="py-8 text-center text-[#8B7A6B]">Carregando relatório...</p>}

      {!loading && activeTab === "revenue" && revenueData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Receita Total" value={formatCurrency(revenueData.totalRevenue)} />
            <StatCard label="Despesas Total" value={formatCurrency(revenueData.totalExpenses)} />
            <StatCard label="Saldo" value={formatCurrency(revenueData.balance)}
              subtitle={revenueData.balance >= 0 ? "Positivo" : "Negativo"} />
            <StatCard label="Transações Pagas" value={String(revenueData.paidCount)} />
          </div>
          <Card>
            <CardHeader><CardTitle>Detalhamento</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4C4B0]">
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Descrição</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Tipo</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Categoria</th>
                      <th className="text-right py-2 text-xs text-[#8B7A6B]">Valor</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Status</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.items.map((item, i) => (
                      <tr key={i} className="border-b border-[#F5F0EB]">
                        <td className="py-2 font-medium">{item.description}</td>
                        <td className="py-2 text-xs capitalize">
                          <span className={`px-2 py-0.5 rounded ${item.transaction_type === "receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {item.transaction_type}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-[#8B7A6B]">{item.category}</td>
                        <td className={`py-2 text-right font-semibold ${item.transaction_type === "receita" ? "text-green-700" : "text-red-600"}`}>
                          {item.transaction_type === "despesa" ? "-" : ""}{formatCurrency(item.amount)}
                        </td>
                        <td className="py-2 text-xs">
                          <span className={`px-2 py-0.5 rounded ${item.status === "pago" ? "bg-green-100 text-green-700" : item.status === "atrasado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">{formatDate(item.due_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && activeTab === "budgets" && budgetData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total de Orçamentos" value={String(budgetData.total)} />
            <StatCard label="Taxa de Conversão" value={`${budgetData.conversionRate}%`} />
            <StatCard label="Valor Médio" value={formatCurrency(budgetData.averageValue)} />
            <StatCard label="Aprovados" value={String(budgetData.byStatus.find((s) => s.status === "aprovado")?.count || 0)} />
          </div>
          <Card>
            <CardHeader><CardTitle>Por Status</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {budgetData.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between p-3 rounded border border-[#D4C4B0]">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                      <p className="text-lg font-bold text-[#3D2519] mt-1">{s.count}</p>
                    </div>
                    <span className="text-sm text-[#8B7A6B]">{formatCurrency(s.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Lista</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4C4B0]">
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Orçamento</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Cliente</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">Status</th>
                      <th className="text-right py-2 text-xs text-[#8B7A6B]">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetData.items.map((item, i) => (
                      <tr key={i} className="border-b border-[#F5F0EB]">
                        <td className="py-2 font-mono text-xs">{item.budget_number}</td>
                        <td className="py-2">{item.customer_name}</td>
                        <td className="py-2 hidden sm:table-cell">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                            {statusLabels[item.status] || item.status}
                          </span>
                        </td>
                        <td className="py-2 text-right font-semibold">{formatCurrency(item.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && activeTab === "orders" && orderData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total de OS" value={String(orderData.total)} />
            <StatCard label="Prazo Médio" value={`${orderData.averageDeliveryDays} dias`} />
            <StatCard label="Entregas no Prazo" value={`${orderData.onTimeRate}%`} />
            <StatCard label="Concluídas" value={String(orderData.byStatus.find((s) => s.status === "entregue")?.count || 0)} />
          </div>
          <Card>
            <CardHeader><CardTitle>Por Status</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {orderData.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between p-3 rounded border border-[#D4C4B0]">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                      <p className="text-lg font-bold text-[#3D2519] mt-1">{s.count}</p>
                    </div>
                    <span className="text-sm text-[#8B7A6B]">{formatCurrency(s.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && activeTab === "inventory" && inventoryData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Materiais" value={String(inventoryData.totalMaterials)} />
            <StatCard label="Valor em Estoque" value={formatCurrency(inventoryData.totalValue)} />
            <StatCard label="Estoque Baixo" value={String(inventoryData.lowStockCount)}
              subtitle={inventoryData.lowStockCount > 0 ? "Atenção necessária" : "Tudo ok"} />
            <StatCard label="Categorias" value={String(inventoryData.byCategory.length)} />
          </div>
          <Card>
            <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {inventoryData.byCategory.map((c) => (
                  <div key={c.category} className="p-3 rounded border border-[#D4C4B0]">
                    <p className="text-sm font-medium text-[#3D2519] capitalize">{c.category}</p>
                    <p className="text-lg font-bold text-[#3D2519]">{c.count} itens</p>
                    <p className="text-xs text-[#8B7A6B]">{formatCurrency(c.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Estoque Baixo</CardTitle></CardHeader>
            <CardContent>
              {inventoryData.materials.filter((m) => m.min_stock > 0 && m.current_stock <= m.min_stock).length === 0 ? (
                <p className="text-sm text-[#8B7A6B]">Nenhum material com estoque baixo</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D4C4B0]">
                        <th className="text-left py-2 text-xs text-[#8B7A6B]">Material</th>
                        <th className="text-left py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">Categoria</th>
                        <th className="text-right py-2 text-xs text-[#8B7A6B]">Estoque</th>
                        <th className="text-right py-2 text-xs text-[#8B7A6B]">Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.materials
                        .filter((m) => m.min_stock > 0 && m.current_stock <= m.min_stock)
                        .map((m, i) => (
                        <tr key={i} className="border-b border-[#F5F0EB] bg-red-50">
                          <td className="py-2 font-medium">{m.name}</td>
                          <td className="py-2 text-xs text-[#8B7A6B] capitalize hidden sm:table-cell">{m.category}</td>
                          <td className="py-2 text-right text-red-600 font-semibold">{m.current_stock} {m.unit}</td>
                          <td className="py-2 text-right text-[#8B7A6B]">{m.min_stock} {m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && activeTab === "customers" && customerData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Total de Clientes" value={String(customerData.totalCustomers)} />
            <StatCard label="Clientes Compradores" value={String(customerData.topCustomers.length)} />
            <StatCard label="Top Cliente" value={customerData.topCustomers[0]?.name || "-"}
              subtitle={customerData.topCustomers[0] ? formatCurrency(customerData.topCustomers[0].total_spent) : ""} />
          </div>
          <Card>
            <CardHeader><CardTitle>Top Clientes por Faturamento</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4C4B0]">
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">#</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B]">Cliente</th>
                      <th className="text-left py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">Telefone</th>
                      <th className="text-right py-2 text-xs text-[#8B7A6B]">Orçamentos</th>
                      <th className="text-right py-2 text-xs text-[#8B7A6B]">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData.topCustomers.map((c, i) => (
                      <tr key={i} className="border-b border-[#F5F0EB]">
                        <td className="py-2 text-[#8B7A6B]">{i + 1}</td>
                        <td className="py-2 font-medium">{c.name}</td>
                        <td className="py-2 text-xs text-[#8B7A6B] hidden sm:table-cell">{c.phone}</td>
                        <td className="py-2 text-right">{c.budget_count}</td>
                        <td className="py-2 text-right font-semibold">{formatCurrency(c.total_spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
