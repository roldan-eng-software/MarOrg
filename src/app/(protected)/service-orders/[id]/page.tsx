"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getServiceOrder,
  updateServiceOrder,
  updateServiceOrderStatus,
} from "@/modules/service-orders/services/service-orders.actions";
import type { ServiceOrder, ServiceOrderItem, Customer } from "@/types";

type OrderData = ServiceOrder & {
  customers: Customer;
  budgets: { budget_number: string; notes_client: string | null };
  items: ServiceOrderItem[];
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_producao: "Em Produção",
  acabamento: "Acabamento",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pendente: "default",
  em_producao: "info",
  acabamento: "warning",
  pronto: "success",
  entregue: "success",
  cancelada: "danger",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

const priorityVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  baixa: "default",
  normal: "info",
  alta: "warning",
  urgente: "danger",
};

export default function ServiceOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [responsible, setResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [priority, setPriority] = useState<string>("normal");
  const [notesInternal, setNotesInternal] = useState("");
  const [notesProduction, setNotesProduction] = useState("");

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  async function loadOrder() {
    try {
      const data = await getServiceOrder(params.id as string);
      setOrder(data as OrderData);
      setResponsible(data.responsible ?? "");
      setStartDate(data.start_date ?? "");
      setEstimatedDelivery(data.estimated_delivery ?? "");
      setPriority(data.priority);
      setNotesInternal(data.notes_internal ?? "");
      setNotesProduction(data.notes_production ?? "");
    } catch {
      showToast("Erro ao carregar ordem de serviço", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!order) return;
    try {
      setSaving(true);
      await updateServiceOrder(order.id, {
        responsible: responsible || null,
        start_date: startDate || null,
        estimated_delivery: estimatedDelivery || null,
        priority: priority as ServiceOrder["priority"],
        notes_internal: notesInternal || null,
        notes_production: notesProduction || null,
      });
      showToast("Ordem de serviço atualizada", "success");
      setEditing(false);
      await loadOrder();
    } catch {
      showToast("Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!order) return;
    try {
      setSaving(true);
      await updateServiceOrderStatus(order.id, newStatus as ServiceOrder["status"]);
      showToast(`Status alterado para ${statusLabels[newStatus]}`, "success");
      await loadOrder();
    } catch {
      showToast("Erro ao alterar status", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  if (!order) {
    return <p className="py-8 text-center text-red-500">Ordem de serviço não encontrada</p>;
  }

  const statusFlow: Record<string, string[]> = {
    pendente: ["em_producao", "cancelada"],
    em_producao: ["acabamento", "cancelada"],
    acabamento: ["pronto", "cancelada"],
    pronto: ["entregue"],
    entregue: [],
    cancelada: ["pendente"],
  };

  const nextStatuses = statusFlow[order.status] || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2519]">
            {order.order_number}
          </h1>
          <p className="text-sm text-[#8B7A6B]">
            Orçamento: {order.budgets.budget_number} | Cliente: {order.customers.full_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={priorityVariants[order.priority]}>
            {priorityLabels[order.priority]}
          </Badge>
          <Badge variant={statusVariants[order.status]}>
            {statusLabels[order.status]}
          </Badge>
          {!editing && order.status !== "entregue" && order.status !== "cancelada" && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Ordem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8B7A6B]">Responsável</label>
              {editing ? (
                <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Nome do responsável" />
              ) : (
                <p className="text-sm text-[#3D2519]">{order.responsible || "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-[#8B7A6B]">Prioridade</label>
              {editing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded border border-[#D4C4B0] bg-white px-3 py-2 text-sm text-[#3D2519]"
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              ) : (
                <p className="text-sm text-[#3D2519]">{priorityLabels[order.priority]}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-[#8B7A6B]">Data Início</label>
              {editing ? (
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              ) : (
                <p className="text-sm text-[#3D2519]">{order.start_date ? formatDate(order.start_date) : "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-[#8B7A6B]">Previsão de Entrega</label>
              {editing ? (
                <Input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} />
              ) : (
                <p className="text-sm text-[#3D2519]">{order.estimated_delivery ? formatDate(order.estimated_delivery) : "-"}</p>
              )}
            </div>
            {order.actual_delivery && (
              <div>
                <label className="text-xs text-[#8B7A6B]">Data Entrega Real</label>
                <p className="text-sm text-[#3D2519]">{formatDate(order.actual_delivery)}</p>
              </div>
            )}
            <div>
              <label className="text-xs text-[#8B7A6B]">Valor Total</label>
              <p className="text-lg font-bold text-[#3D2519]">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8B7A6B]">Observações Internas</label>
              {editing ? (
                <Textarea value={notesInternal} onChange={(e) => setNotesInternal(e.target.value)} />
              ) : (
                <p className="text-sm text-[#3D2519]">{order.notes_internal || "-"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-[#8B7A6B]">Observações de Produção</label>
              {editing ? (
                <Textarea value={notesProduction} onChange={(e) => setNotesProduction(e.target.value)} />
              ) : (
                <p className="text-sm text-[#3D2519]">{order.notes_production || "-"}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-[#D4C4B0] p-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#8B7A6B]">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-[#3D2519]">{item.description}</p>
                    <p className="text-xs text-[#8B7A6B]">
                      {item.material && `Material: ${item.material}`}
                      {item.finish && ` | Acabamento: ${item.finish}`}
                      {item.width_cm && item.height_cm && item.depth_cm && ` | ${item.width_cm}×${item.depth_cm}×${item.height_cm}cm`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#3D2519]">{formatCurrency(item.total_price)}</p>
                  <p className="text-xs text-[#8B7A6B]">{item.quantity} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {nextStatuses.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant={status === "cancelada" ? "danger" : "primary"}
              onClick={() => handleStatusChange(status)}
              disabled={saving}
            >
              {statusLabels[status]}
            </Button>
          ))}
        </div>
      )}

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
