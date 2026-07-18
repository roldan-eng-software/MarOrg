"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { listServiceOrders, updateServiceOrderStatus } from "@/modules/service-orders/services/service-orders.actions";
import type { ServiceOrder } from "@/types";

type OrderWithCustomer = ServiceOrder & { customers: { full_name: string; phone: string } };

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: "Pendente", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  em_producao: { label: "Em Produção", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  acabamento: { label: "Acabamento", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  pronto: { label: "Pronto", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  entregue: { label: "Entregue", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  cancelada: { label: "Cancelada", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  baixa: { label: "Baixa", variant: "default" },
  normal: { label: "Normal", variant: "info" },
  alta: { label: "Alta", variant: "warning" },
  urgente: { label: "Urgente", variant: "danger" },
};

const kanbanColumns = ["pendente", "em_producao", "acabamento", "pronto"];

export default function ServiceOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await listServiceOrders();
      setOrders(data as OrderWithCustomer[]);
    } catch {
      showToast("Erro ao carregar ordens de serviço", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvanceStatus(orderId: string, currentStatus: string) {
    const flow: Record<string, string> = {
      pendente: "em_producao",
      em_producao: "acabamento",
      acabamento: "pronto",
      pronto: "entregue",
    };
    const next = flow[currentStatus];
    if (!next) return;

    try {
      await updateServiceOrderStatus(orderId, next as ServiceOrder["status"]);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next as ServiceOrder["status"] } : o))
      );
      showToast(`Status alterado para ${statusConfig[next].label}`, "success");
    } catch {
      showToast("Erro ao alterar status", "error");
    }
  }

  function getOrdersByStatus(status: string) {
    return orders.filter((o) => o.status === status);
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Ordens de Serviço</h1>
        <div className="flex gap-2">
          <Button
            variant={view === "kanban" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
          <Button
            variant={view === "list" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
          >
            Lista
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((status) => {
            const config = statusConfig[status];
            const columnOrders = getOrdersByStatus(status);
            return (
              <div key={status}>
                <div className={`mb-3 rounded-t-lg border-2 px-4 py-2 ${config.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`text-xs ${config.color}`}>
                      {columnOrders.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {columnOrders.map((order) => (
                    <div
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/service-orders/${order.id}`)}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#8B7A6B]">
                            {order.order_number}
                          </span>
                          <Badge variant={priorityConfig[order.priority].variant} className="text-[10px]">
                            {priorityConfig[order.priority].label}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-[#3D2519] truncate">
                          {order.customers.full_name}
                        </p>
                        <p className="text-xs text-[#8B7A6B]">
                          {formatCurrency(order.total_amount)}
                        </p>
                        {order.estimated_delivery && (
                          <p className="text-[10px] text-[#8B7A6B]">
                            Entrega: {formatDate(order.estimated_delivery)}
                          </p>
                        )}
                        {status !== "pronto" && status !== "entregue" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceStatus(order.id, order.status);
                            }}
                          >
                            Avançar →
                          </Button>
                        )}
                      </CardContent>
                      </Card>
                    </div>
                  ))}
                  {columnOrders.length === 0 && (
                    <p className="py-8 text-center text-xs text-[#8B7A6B]">
                      Nenhuma OS
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-[#8B7A6B]">
                Nenhuma ordem de serviço encontrada
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="cursor-pointer"
                onClick={() => router.push(`/service-orders/${order.id}`)}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-2 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm text-[#8B7A6B]">{order.order_number}</p>
                      <p className="font-medium text-[#3D2519]">{order.customers.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={priorityConfig[order.priority].variant}>
                      {priorityConfig[order.priority].label}
                    </Badge>
                    <span className={`text-xs px-2 py-1 rounded ${statusConfig[order.status].bg} ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].label}
                    </span>
                    <span className="text-sm font-semibold text-[#3D2519]">
                      {formatCurrency(order.total_amount)}
                    </span>
                    {order.estimated_delivery && (
                      <span className="text-xs text-[#8B7A6B]">
                        Entrega: {formatDate(order.estimated_delivery)}
                      </span>
                    )}
                  </div>
                </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
