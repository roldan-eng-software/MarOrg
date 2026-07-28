"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listBudgets,
  updateBudgetStatus,
} from "@/modules/budgets/services/budgets.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
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
  concluido: "Concluído",
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
  concluido: "success",
};

const statusOptions: { value: Budget["status"]; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
  { value: "em_analise", label: "Em Análise" },
  { value: "aprovado", label: "Aprovado" },
  { value: "recusado", label: "Recusado" },
  { value: "vencido", label: "Vencido" },
  { value: "revisado", label: "Revisado" },
  { value: "concluido", label: "Concluído" },
];

export default function BudgetsListPage() {
  const [budgets, setBudgets] = useState<BudgetWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [dialogBudget, setDialogBudget] = useState<BudgetWithCustomer | null>(
    null
  );
  const [pendingStatus, setPendingStatus] = useState<Budget["status"] | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  function handleBadgeClick(budgetId: string) {
    setEditingStatusId(budgetId === editingStatusId ? null : budgetId);
  }

  function handleStatusSelect(budget: BudgetWithCustomer, newStatus: string) {
    if (newStatus === budget.status) {
      setEditingStatusId(null);
      return;
    }
    setDialogBudget(budget);
    setPendingStatus(newStatus as Budget["status"]);
  }

  async function confirmStatusChange() {
    if (!dialogBudget || !pendingStatus) return;
    try {
      setUpdatingId(dialogBudget.id);
      await updateBudgetStatus(dialogBudget.id, pendingStatus);
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === dialogBudget.id ? { ...b, status: pendingStatus } : b
        )
      );
      showToast(
        `Status alterado para ${statusLabels[pendingStatus]}`,
        "success"
      );
    } catch {
      showToast("Erro ao alterar status", "error");
    } finally {
      setUpdatingId(null);
      setDialogBudget(null);
      setPendingStatus(null);
      setEditingStatusId(null);
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
                    {editingStatusId === budget.id ? (
                      <select
                        value={budget.status}
                        onChange={(e) =>
                          handleStatusSelect(budget, e.target.value)
                        }
                        onBlur={() => setEditingStatusId(null)}
                        disabled={updatingId === budget.id}
                        className="rounded-full border border-[#D4C4B0] bg-white px-2.5 py-0.5 text-xs font-medium text-[#3D2519] focus:outline-none focus:ring-2 focus:ring-[#5B3A29]"
                        autoFocus
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => handleBadgeClick(budget.id)}
                      >
                        <Badge variant={statusVariants[budget.status]}>
                          {statusLabels[budget.status]}
                        </Badge>
                      </button>
                    )}
                    <Link href={`/budgets/${budget.id}`}>
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

      <Dialog
        open={!!dialogBudget}
        onClose={() => {
          setDialogBudget(null);
          setPendingStatus(null);
        }}
      >
        <DialogHeader
          title="Alterar Status"
          description={`Deseja alterar o status de "${dialogBudget ? statusLabels[dialogBudget.status] : ""}" para "${pendingStatus ? statusLabels[pendingStatus] : ""}"?`}
        />
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setDialogBudget(null);
              setPendingStatus(null);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={confirmStatusChange} disabled={updatingId !== null}>
            {updatingId ? "Alterando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
