"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils/format";

interface DeliveryOrder {
  id: string;
  order_number: string;
  status: string;
  priority: string;
  estimated_delivery: string;
  actual_delivery: string | null;
  total_amount: number;
  responsible: string | null;
  customers: { full_name: string; phone: string } | null;
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_producao: "Em Produção",
  acabamento: "Acabamento",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  em_producao: "bg-blue-100 text-blue-700",
  acabamento: "bg-purple-100 text-purple-700",
  pronto: "bg-green-100 text-green-700",
  entregue: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

const priorityColors: Record<string, string> = {
  baixa: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-600",
  alta: "bg-orange-100 text-orange-600",
  urgente: "bg-red-100 text-red-600",
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isToday(year: number, month: number, day: number) {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

function isPast(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function SchedulePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("service_orders")
        .select("id, order_number, status, priority, estimated_delivery, actual_delivery, total_amount, responsible, customers(full_name, phone)")
        .not("estimated_delivery", "is", null)
        .in("status", ["pendente", "em_producao", "acabamento", "pronto"])
        .order("estimated_delivery");

      if (data) setOrders(data as unknown as DeliveryOrder[]);
    } catch {
      console.error("Erro ao carregar entregas");
    } finally {
      setLoading(false);
    }
  }

  function getOrdersForDate(dateKey: string) {
    return orders.filter((o) => o.estimated_delivery === dateKey);
  }

  function getMonthStats() {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const monthOrders = orders.filter((o) => o.estimated_delivery?.startsWith(monthStr));
    const totalValue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    return { count: monthOrders.length, totalValue };
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthStats = getMonthStats();
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const selectedOrders = selectedDate ? getOrdersForDate(selectedDate) : [];

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function goToToday() {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Agenda de Entregas</h1>
        <Button variant="ghost" onClick={goToToday}>Hoje</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Entregas no Mês</p>
            <p className="text-2xl font-bold text-[#3D2519]">{monthStats.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Valor Total</p>
            <p className="text-2xl font-bold text-[#3D2519]">{formatCurrency(monthStats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[#8B7A6B]">Total de Entregas</p>
            <p className="text-2xl font-bold text-[#3D2519]">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}>← Anterior</Button>
              <CardTitle className="text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={nextMonth}>Próximo →</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-[#8B7A6B] py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="h-24" />;
                  }
                  const dateKey = formatDateKey(currentYear, currentMonth, day);
                  const dayOrders = getOrdersForDate(dateKey);
                  const today = isToday(currentYear, currentMonth, day);
                  const past = isPast(currentYear, currentMonth, day);
                  const selected = selectedDate === dateKey;

                  return (
                    <div
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`h-24 rounded-lg border p-1.5 cursor-pointer transition-colors ${
                        selected
                          ? "border-[#5B3A29] bg-[#F5F0EB]"
                          : today
                            ? "border-[#5B3A29] border-2"
                            : past
                              ? "border-gray-200 bg-gray-50"
                              : "border-[#D4C4B0] hover:border-[#5B3A29]"
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        today ? "text-[#5B3A29] font-bold" : past ? "text-gray-400" : "text-[#3D2519]"
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayOrders.slice(0, 3).map((o) => (
                          <div
                            key={o.id}
                            className={`text-[8px] leading-tight px-1 py-0.5 rounded truncate ${
                              o.status === "pronto"
                                ? "bg-green-100 text-green-700"
                                : o.priority === "urgente"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {o.order_number}
                          </div>
                        ))}
                        {dayOrders.length > 3 && (
                          <span className="text-[8px] text-[#8B7A6B]">+{dayOrders.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Entregas - ${formatDate(selectedDate + "T12:00:00")}`
                  : "Selecione um dia"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedOrders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-lg border border-[#D4C4B0] p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/service-orders/${order.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-[#8B7A6B]">{order.order_number}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#3D2519]">
                          {order.customers?.full_name || "Cliente"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${priorityColors[order.priority]}`}>
                            {order.priority === "urgente" ? "Urgente" : order.priority}
                          </span>
                          <span className="text-sm font-semibold text-[#3D2519]">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        {order.responsible && (
                          <p className="text-[10px] text-[#8B7A6B] mt-1">
                            Resp: {order.responsible}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8B7A6B] text-center py-4">
                    Nenhuma entrega para este dia
                  </p>
                )
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-[#8B7A6B]">
                    Clique em um dia no calendário para ver as entregas.
                  </p>
                  {orders.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#3D2519] mb-2">Próximas entregas:</p>
                      {orders.slice(0, 5).map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between py-1.5 border-b border-[#F5F0EB] last:border-0 cursor-pointer hover:bg-[#F5F0EB] -mx-1 px-1 rounded"
                          onClick={() => router.push(`/service-orders/${o.id}`)}
                        >
                          <div>
                            <span className="text-xs font-medium text-[#3D2519]">{o.order_number}</span>
                            <span className="text-xs text-[#8B7A6B] ml-2">{o.customers?.full_name}</span>
                          </div>
                          <span className="text-[10px] text-[#8B7A6B]">
                            {formatDate(o.estimated_delivery + "T12:00:00")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
