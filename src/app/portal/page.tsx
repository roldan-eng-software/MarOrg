"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils/format";

interface CustomerBudget {
  id: string;
  budget_number: string;
  status: string;
  total_amount: number;
  validity_days: number;
  delivery_days: number;
  notes_client: string | null;
  payment_conditions: string | null;
  payment_types: string[];
  payment_installments: { installment: number; description: string; due_date: string; percentage: number }[];
  created_at: string;
  sent_at: string | null;
  customers: {
    full_name: string;
    phone: string;
  };
  items: {
    id: string;
    description: string;
    material: string | null;
    width_cm: number | null;
    depth_cm: number | null;
    height_cm: number | null;
    finish: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  vencido: "Vencido",
  revisado: "Revisado",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  rascunho: "default",
  enviado: "info",
  em_analise: "warning",
  aprovado: "success",
  recusado: "danger",
  vencido: "danger",
  revisado: "info",
};

export default function PortalPage() {
  const [budgetNumber, setBudgetNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<CustomerBudget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<CustomerBudget | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!budgetNumber.trim() && !customerPhone.trim()) {
      showToast("Informe o número do orçamento ou telefone", "error");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (budgetNumber.trim()) params.set("budget_number", budgetNumber.trim());
      if (customerPhone.trim()) params.set("phone", customerPhone.trim());

      const response = await fetch(`/api/portal/budgets?${params.toString()}`);

      if (!response.ok) {
        showToast("Nenhum orçamento encontrado", "error");
        setBudgets([]);
        setSelectedBudget(null);
        return;
      }

      const data = await response.json();
      setBudgets(data.budgets || []);
      setSelectedBudget(null);

      if (data.budgets?.length === 0) {
        showToast("Nenhum orçamento encontrado", "error");
      }
    } catch {
      showToast("Erro ao buscar orçamento", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleViewBudget(budget: CustomerBudget) {
    setSelectedBudget(budget);
  }

  if (selectedBudget) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <Button variant="ghost" onClick={() => setSelectedBudget(null)}>
            ← Voltar
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#3D2519]">Roldan Marcenaria</h1>
            <p className="text-sm text-[#8B7A6B]">Móveis Planejados sob Medida</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedBudget.budget_number}</CardTitle>
                <Badge variant={statusVariants[selectedBudget.status] || "default"}>
                  {statusLabels[selectedBudget.status] || selectedBudget.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#8B7A6B]">Cliente</p>
                  <p className="font-medium text-[#3D2519]">{selectedBudget.customers.full_name}</p>
                </div>
                <div>
                  <p className="text-[#8B7A6B]">Data</p>
                  <p className="font-medium text-[#3D2519]">{formatDate(selectedBudget.created_at)}</p>
                </div>
                <div>
                  <p className="text-[#8B7A6B]">Validade</p>
                  <p className="font-medium text-[#3D2519]">{selectedBudget.validity_days} dias</p>
                </div>
                <div>
                  <p className="text-[#8B7A6B]">Prazo de Entrega</p>
                  <p className="font-medium text-[#3D2519]">{selectedBudget.delivery_days} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedBudget.items.map((item) => (
                  <div key={item.id} className="rounded border border-[#D4C4B0] bg-[#F5F0EB] p-3">
                    <p className="font-medium text-[#3D2519]">{item.description}</p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-[#8B7A6B]">
                      {item.material && <p>Material: {item.material}</p>}
                      {item.width_cm && item.depth_cm && item.height_cm && (
                        <p>Dimensões: {item.width_cm} x {item.depth_cm} x {item.height_cm} cm</p>
                      )}
                      {item.finish && <p>Acabamento: {item.finish}</p>}
                      <p>Qtd: {item.quantity}</p>
                      <p>Valor: {formatCurrency(item.unit_price)}</p>
                    </div>
                    <p className="mt-2 text-right font-semibold text-[#3D2519]">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-[#D4C4B0] pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#3D2519]">Total</span>
                  <span className="text-[#3D2519]">{formatCurrency(selectedBudget.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(selectedBudget.payment_conditions || selectedBudget.payment_types?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Condições de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedBudget.payment_types?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#8B7A6B]">Formas de Pagamento</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBudget.payment_types.map((type) => (
                        <Badge key={type} variant="default">
                          {type.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedBudget.payment_conditions && (
                  <div>
                    <p className="text-sm text-[#8B7A6B]">Condições</p>
                    <p className="text-[#3D2519]">{selectedBudget.payment_conditions}</p>
                  </div>
                )}
                {selectedBudget.payment_installments?.length > 0 && (
                  <div>
                    <p className="text-sm text-[#8B7A6B]">Parcelamento</p>
                    <div className="mt-1 space-y-1">
                      {selectedBudget.payment_installments.map((inst, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[#8B7A6B]">{inst.installment}ª parcela - {inst.description}</span>
                          <span className="font-medium text-[#3D2519]">{inst.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedBudget.notes_client && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#3D2519] whitespace-pre-wrap">{selectedBudget.notes_client}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-4 md:p-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3D2519]">Roldan Marcenaria</h1>
          <p className="text-sm text-[#8B7A6B]">Móveis Planejados sob Medida</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acessar Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                id="budget_number"
                label="Número do Orçamento"
                value={budgetNumber}
                onChange={(e) => setBudgetNumber(e.target.value)}
                placeholder="ORC-2026-0001"
              />
              <div className="text-center text-sm text-[#8B7A6B]">ou</div>
              <Input
                id="phone"
                label="Telefone do Cliente"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Buscando..." : "Buscar Orçamento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {budgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos Encontrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between rounded border border-[#D4C4B0] bg-[#F5F0EB] p-3"
                  >
                    <div>
                      <p className="font-medium text-[#3D2519]">{budget.budget_number}</p>
                      <p className="text-xs text-[#8B7A6B]">
                        {formatCurrency(budget.total_amount)} · {formatDate(budget.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariants[budget.status] || "default"}>
                        {statusLabels[budget.status] || budget.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleViewBudget(budget)}>
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
