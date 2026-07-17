"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listBudgets } from "@/modules/budgets/services/budgets.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Budget } from "@/types";

type BudgetWithCustomer = Budget & {
  customers: { full_name: string; phone: string };
};

const statusLabels: Record<Budget["status"], string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  vencido: "Vencido",
  revisado: "Revisado",
};

const statusVariants: Record<
  Budget["status"],
  "default" | "success" | "warning" | "danger" | "info"
> = {
  rascunho: "default",
  enviado: "info",
  em_analise: "warning",
  aprovado: "success",
  recusado: "danger",
  vencido: "danger",
  revisado: "info",
};

export default function BudgetsListPage() {
  const [budgets, setBudgets] = useState<BudgetWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    try {
      setLoading(true);
      const data = await listBudgets();
      setBudgets(data as BudgetWithCustomer[]);
    } catch {
      showToast("Erro ao carregar orçamentos", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Orçamentos</h1>
        <Link href="/budgets/new">
          <Button>Novo Orçamento</Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
          ) : budgets.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">
              Nenhum orçamento encontrado
            </p>
          ) : (
            <div className="divide-y divide-[#D4C4B0]">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-[#3D2519]">
                      {budget.budget_number}
                    </p>
                    <p className="text-sm text-[#8B7A6B]">
                      {budget.customers.full_name} ·{" "}
                      {formatCurrency(budget.total_amount)} ·{" "}
                      {formatDate(budget.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[budget.status]}>
                      {statusLabels[budget.status]}
                    </Badge>
                    <Link href={`/budgets/${budget.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
