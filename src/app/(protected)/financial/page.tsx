"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getFinancialSummary,
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type FinancialSummary,
  type FinancialTransaction,
  type FinancialFilters,
} from "@/modules/financial/services/financial.actions";
import { listSuppliers } from "@/modules/suppliers/services/suppliers.actions";
import type { Supplier } from "@/types";

const categories = [
  "Vendas",
  "Serviços",
  "Material",
  "Mão de Obra",
  "Aluguel",
  "Energia",
  "Internet",
  "Transporte",
  "Marketing",
  "Impostos",
  "Manutenção",
  "Pró-Labore",
  "Outros",
];

const paymentMethods = ["PIX", "Crédito", "Débito", "Boleto", "Dinheiro", "Transferência"];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  atrasado: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-800",
};

export default function FinancialPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
  const [filters, setFilters] = useState<FinancialFilters>({ startDate: firstDay, endDate: lastDay });
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [typeFilter, setTypeFilter] = useState<"receita" | "despesa" | "">("");
  const lastFetchRef = useRef(0);

  useEffect(() => {
    loadData();

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  async function loadData() {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    try {
      setLoading(true);
      const [summaryData, transactionsData, suppliersData] = await Promise.all([
        getFinancialSummary(filters),
        listTransactions(filters),
        listSuppliers(),
      ]);
      setSummary(summaryData);
      setTransactions(transactionsData);
      setSuppliers(suppliersData);
    } catch {
      showToast("Erro ao carregar dados financeiros", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    const newFilters: FinancialFilters = {};
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    if (typeFilter) newFilters.type = typeFilter as "receita" | "despesa";
    setFilters(newFilters);

    try {
      setLoading(true);
      const [summaryData, transactionsData] = await Promise.all([
        getFinancialSummary(newFilters),
        listTransactions(newFilters),
      ]);
      setSummary(summaryData);
      setTransactions(transactionsData);
    } catch {
      showToast("Erro ao filtrar", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleNewTransaction() {
    setEditingTransaction(null);
    setShowModal(true);
  }

  async function handleSaveTransaction(data: Partial<FinancialTransaction>) {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data);
        showToast("Transação atualizada", "success");
      } else {
        await createTransaction(data as Omit<FinancialTransaction, "id" | "created_at" | "suppliers">);
        showToast("Transação criada", "success");
      }
      setShowModal(false);
      setEditingTransaction(null);
      await loadData();
    } catch {
      showToast("Erro ao salvar transação", "error");
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      await updateTransaction(id, {
        status: "pago",
        paid_date: new Date().toISOString().split("T")[0],
      });
      showToast("Transação marcada como paga", "success");
      await loadData();
    } catch {
      showToast("Erro ao atualizar transação", "error");
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!confirm("Excluir esta transação?")) return;
    try {
      await deleteTransaction(id);
      showToast("Transação excluída", "success");
      await loadData();
    } catch {
      showToast("Erro ao excluir transação", "error");
    }
  }

  if (loading && !summary) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Fluxo de Caixa</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleNewTransaction()}>
            + Receita
          </Button>
          <Button variant="secondary" onClick={() => handleNewTransaction()}>
            + Despesa
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <Input
              id="startDate"
              label="Data Início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id="endDate"
              label="Data Fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="w-full sm:w-40">
              <label className="block text-sm text-[#8B7A6B] mb-1">Tipo</label>
              <select
                className="w-full rounded-md border border-[#D4C4B0] bg-white px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "receita" | "despesa" | "")}
              >
                <option value="">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
            <Button onClick={handleFilter}>Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-[#8B7A6B]">Receitas</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalReceitas)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-[#8B7A6B]">Despesas Operacionais</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalDespesasOperacionais)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-[#8B7A6B]">Pró-Labore</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.totalProLabore)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-[#8B7A6B]">Saldo Líquido</p>
              <p className={`text-xl font-bold ${summary.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(summary.saldo)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-[#8B7A6B]">Pendentes</p>
              <p className="text-xl font-bold text-yellow-600">
                {formatCurrency(summary.receitasPendentes + summary.despesasPendentes)}
              </p>
              {(summary.receitasAtrasadas + summary.despesasAtrasadas) > 0 && (
                <p className="text-xs text-red-600">
                  {formatCurrency(summary.receitasAtrasadas + summary.despesasAtrasadas)} atrasado(s)
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">Nenhuma transação encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4C4B0]">
                    <th className="py-2 text-left text-xs text-[#8B7A6B]">Tipo</th>
                    <th className="py-2 text-left text-xs text-[#8B7A6B]">Descrição</th>
                    <th className="py-2 text-left text-xs text-[#8B7A6B] hidden sm:table-cell">Categoria</th>
                    <th className="py-2 text-left text-xs text-[#8B7A6B] hidden md:table-cell">Vencimento</th>
                    <th className="py-2 text-right text-xs text-[#8B7A6B]">Valor</th>
                    <th className="py-2 text-center text-xs text-[#8B7A6B]">Status</th>
                    <th className="py-2 text-right text-xs text-[#8B7A6B]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[#F5F0EB]">
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          t.transaction_type === "receita"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {t.transaction_type === "receita" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-[#3D2519]">{t.description}</p>
                        {t.suppliers && (
                          <p className="text-xs text-[#8B7A6B]">{t.suppliers.name}</p>
                        )}
                      </td>
                      <td className="py-3 text-[#8B7A6B] hidden sm:table-cell">
                        {t.category === "Pró-Labore" ? (
                          <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Pró-Labore
                          </span>
                        ) : (
                          t.category
                        )}
                      </td>
                      <td className="py-3 text-[#8B7A6B] hidden md:table-cell">
                        {formatDate(t.due_date)}
                        {t.paid_date && (
                          <p className="text-xs text-green-600">Pago: {formatDate(t.paid_date)}</p>
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold text-[#3D2519]">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[t.status] || "bg-gray-100 text-gray-700"}`}>
                          {statusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {t.status === "pendente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleMarkPaid(t.id)}
                            >
                              Pago
                            </Button>
                          )}
                          {t.status === "pago" && t.transaction_type === "receita" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => window.open(`/api/financial/${t.id}/receipt`, "_blank")}
                            >
                              Recibo
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteTransaction(t.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          suppliers={suppliers}
          onSave={handleSaveTransaction}
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

function TransactionModal({
  transaction,
  suppliers,
  onSave,
  onClose,
}: {
  transaction: FinancialTransaction | null;
  suppliers: Supplier[];
  onSave: (data: Partial<FinancialTransaction>) => Promise<void>;
  onClose: () => void;
}) {
  const [type, setType] = useState<"receita" | "despesa">(transaction?.transaction_type || "receita");
  const [category, setCategory] = useState(transaction?.category || "Vendas");
  const [description, setDescription] = useState(transaction?.description || "");
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [dueDate, setDueDate] = useState(transaction?.due_date || new Date().toISOString().split("T")[0]);
  const [supplierId, setSupplierId] = useState(transaction?.supplier_id || "");
  const [paymentMethod, setPaymentMethod] = useState(transaction?.payment_method || "");
  const [notes, setNotes] = useState(transaction?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount || !dueDate) {
      showToast("Preencha os campos obrigatórios", "error");
      return;
    }
    setSaving(true);
    await onSave({
      transaction_type: type,
      category,
      description,
      amount: parseFloat(amount),
      due_date: dueDate,
      status: "pendente",
      supplier_id: supplierId || null,
      payment_method: paymentMethod || null,
      notes: notes || null,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-lg font-bold text-[#3D2519]">
          {transaction ? "Editar Transação" : "Nova Transação"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "receita" ? "primary" : "ghost"}
              onClick={() => setType("receita")}
            >
              Receita
            </Button>
            <Button
              type="button"
              variant={type === "despesa" ? "primary" : "ghost"}
              onClick={() => setType("despesa")}
            >
              Despesa
            </Button>
          </div>

          <div>
            <label className="block text-sm text-[#8B7A6B] mb-1">Descrição *</label>
            <input
              type="text"
              className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8B7A6B] mb-1">Categoria</label>
              <select
                className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#8B7A6B] mb-1">Valor *</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8B7A6B] mb-1">Vencimento *</label>
              <input
                type="date"
                className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#8B7A6B] mb-1">Pagamento</label>
              <select
                className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Selecione</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {type === "despesa" && (
            <div>
              <label className="block text-sm text-[#8B7A6B] mb-1">Fornecedor</label>
              <select
                className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Selecione</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-[#8B7A6B] mb-1">Observações</label>
            <textarea
              className="w-full rounded-md border border-[#D4C4B0] px-3 py-2 text-sm"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
