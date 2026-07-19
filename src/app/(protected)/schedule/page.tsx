"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { WeekView } from "@/modules/schedule/components/week-view";
import { EventDialog } from "@/modules/schedule/components/event-dialog";
import { ScheduleFilters } from "@/modules/schedule/components/schedule-filters";
import {
  listScheduleEvents,
  getFinancialDueDates,
} from "@/modules/schedule/services/schedule.actions";
import type { ScheduleEvent } from "@/types";

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

interface FinancialDueDate {
  id: string;
  transaction_type: string;
  category: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
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

const eventTypeLabels: Record<string, string> = {
  reuniao: "Reunião",
  visita: "Visita",
  followup: "Follow-up",
  outro: "Outro",
};

const eventTypeBadgeColors: Record<string, string> = {
  reuniao: "bg-purple-100 text-purple-700",
  visita: "bg-orange-100 text-orange-700",
  followup: "bg-teal-100 text-teal-700",
  outro: "bg-gray-100 text-gray-700",
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

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function SchedulePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [financialDueDates, setFinancialDueDates] = useState<FinancialDueDate[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const [showOrders, setShowOrders] = useState(true);
  const [showFinancial, setShowFinancial] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();

      const [ordersResult, financialResult, eventsResult] = await Promise.allSettled([
        supabase
          .from("service_orders")
          .select("id, order_number, status, priority, estimated_delivery, actual_delivery, total_amount, responsible, customers(full_name, phone)")
          .not("estimated_delivery", "is", null)
          .in("status", ["pendente", "em_producao", "acabamento", "pronto"])
          .order("estimated_delivery"),
        getFinancialDueDates(currentYear, currentMonth),
        listScheduleEvents(currentYear, currentMonth),
      ]);

      if (ordersResult.status === "fulfilled" && ordersResult.value.data) {
        setOrders(ordersResult.value.data as unknown as DeliveryOrder[]);
      }

      if (financialResult.status === "fulfilled") {
        setFinancialDueDates(financialResult.value as FinancialDueDate[]);
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
      }
    } catch {
      console.error("Erro ao carregar dados da agenda");
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getOrdersForDate(dateKey: string) {
    return orders.filter((o) => o.estimated_delivery === dateKey);
  }

  function getFinancialForDate(dateKey: string) {
    return financialDueDates.filter((f) => f.due_date === dateKey);
  }

  function getEventsForDate(dateKey: string) {
    return events.filter((e) => e.event_date === dateKey);
  }

  function getMonthStats() {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const monthOrders = orders.filter((o) => o.estimated_delivery?.startsWith(monthStr));
    const monthFinancial = financialDueDates.filter((f) => f.due_date?.startsWith(monthStr));
    const totalValue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const pendingReceives = monthFinancial
      .filter((f) => f.transaction_type === "receita" && f.status === "pendente")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    return { count: monthOrders.length, totalValue, eventCount: events.length, pendingReceives };
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
  const selectedFinancial = selectedDate ? getFinancialForDate(selectedDate) : [];
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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

  function prevWeek() {
    const current = viewMode === "week"
      ? getWeekStart(new Date(currentYear, currentMonth, selectedDate ? parseInt(selectedDate.split("-")[2]) : 1))
      : new Date(currentYear, currentMonth, 1);
    current.setDate(current.getDate() - 7);
    setCurrentYear(current.getFullYear());
    setCurrentMonth(current.getMonth());
    setSelectedDate(formatDateKey(current.getFullYear(), current.getMonth(), current.getDate()));
  }

  function nextWeek() {
    const current = viewMode === "week"
      ? getWeekStart(new Date(currentYear, currentMonth, selectedDate ? parseInt(selectedDate.split("-")[2]) : 1))
      : new Date(currentYear, currentMonth, 1);
    current.setDate(current.getDate() + 7);
    setCurrentYear(current.getFullYear());
    setCurrentMonth(current.getMonth());
    setSelectedDate(formatDateKey(current.getFullYear(), current.getMonth(), current.getDate()));
  }

  function handleOpenNewEvent(date: string) {
    setEditingEvent(null);
    setSelectedDate(date);
    setEventDialogOpen(true);
  }

  function handleEditEvent(event: ScheduleEvent) {
    setEditingEvent(event);
    setSelectedDate(event.event_date);
    setEventDialogOpen(true);
  }

  function handleEventSaved() {
    loadData();
  }

  const weekStart = selectedDate
    ? getWeekStart(new Date(selectedDate + "T12:00:00"))
    : getWeekStart(new Date());

  if (loading) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Agenda</h1>
          <p className="text-xs text-[#8B7A6B]">Gerencie suas entregas, compromissos e financeiro</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Mensal
          </Button>
          <Button
            variant={viewMode === "week" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Semanal
          </Button>
          <Button variant="ghost" onClick={goToToday}>Hoje</Button>
          <Button onClick={() => handleOpenNewEvent(selectedDate ?? formatDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))}>
            + Evento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-[#8B7A6B]">Entregas no Mês</p>
            <p className="text-xl font-bold text-[#3D2519]">{monthStats.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-[#8B7A6B]">Valor Entregas</p>
            <p className="text-xl font-bold text-[#3D2519]">{formatCurrency(monthStats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-[#8B7A6B]">A Receber</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(monthStats.pendingReceives)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-[#8B7A6B]">Eventos</p>
            <p className="text-xl font-bold text-[#3D2519]">{monthStats.eventCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ScheduleFilters
        showOrders={showOrders}
        showFinancial={showFinancial}
        showEvents={showEvents}
        onToggleOrders={() => setShowOrders(!showOrders)}
        onToggleFinancial={() => setShowFinancial(!showFinancial)}
        onToggleEvents={() => setShowEvents(!showEvents)}
      />

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={viewMode === "month" ? prevMonth : prevWeek}>
          ← Anterior
        </Button>
        <h2 className="text-sm font-semibold text-[#3D2519]">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <Button variant="ghost" size="sm" onClick={viewMode === "month" ? nextMonth : nextWeek}>
          Próximo →
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar / Week View */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-3">
              {viewMode === "month" ? (
                <div className="grid grid-cols-7 gap-1">
                  {DAY_NAMES.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-[#8B7A6B] py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="h-16 sm:h-20 md:h-24" />;
                    }
                    const dateKey = formatDateKey(currentYear, currentMonth, day);
                    const dayOrders = showOrders ? getOrdersForDate(dateKey) : [];
                    const dayFinancial = showFinancial ? getFinancialForDate(dateKey) : [];
                    const dayEvents = showEvents ? getEventsForDate(dateKey) : [];
                    const today = isToday(currentYear, currentMonth, day);
                    const past = isPast(currentYear, currentMonth, day);
                    const selected = selectedDate === dateKey;
                    const totalItems = dayOrders.length + dayFinancial.length + dayEvents.length;

                    return (
                      <div
                        key={dateKey}
                        onClick={() => setSelectedDate(dateKey)}
                        className={`h-16 sm:h-20 md:h-24 rounded-lg border p-1.5 cursor-pointer transition-colors ${
                          selected
                            ? "border-[#5B3A29] bg-[#F5F0EB]"
                            : today
                              ? "border-[#5B3A29] border-2"
                              : past
                                ? "border-gray-200 bg-gray-50"
                                : "border-[#D4C4B0] hover:border-[#5B3A29]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${
                            today ? "text-[#5B3A29] font-bold" : past ? "text-gray-400" : "text-[#3D2519]"
                          }`}>
                            {day}
                          </span>
                          {totalItems > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNewEvent(dateKey);
                              }}
                              className="text-[10px] text-[#8B7A6B] hover:text-[#5B3A29] font-bold"
                            >
                              +
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5 space-y-0.5">
                          {dayOrders.slice(0, 2).map((o) => (
                            <div
                              key={o.id}
                              className={`text-[7px] leading-tight px-1 py-0.5 rounded truncate ${
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
                          {dayFinancial.slice(0, 1).map((f) => (
                            <div
                              key={f.id}
                              className={`text-[7px] leading-tight px-1 py-0.5 rounded truncate ${
                                f.transaction_type === "receita"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {f.category}
                            </div>
                          ))}
                          {dayEvents.slice(0, 1).map((e) => (
                            <div
                              key={e.id}
                              className="text-[7px] leading-tight px-1 py-0.5 rounded truncate"
                              style={{ backgroundColor: e.color + "20", color: e.color }}
                            >
                              {e.title}
                            </div>
                          ))}
                          {totalItems > 4 && (
                            <span className="text-[7px] text-[#8B7A6B]">+{totalItems - 4}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <WeekView
                  weekStart={weekStart}
                  orders={showOrders ? orders : []}
                  financialDueDates={showFinancial ? financialDueDates : []}
                  events={showEvents ? events : []}
                  onDateClick={setSelectedDate}
                  onEventClick={handleEditEvent}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">
                {selectedDate
                  ? formatDate(selectedDate + "T12:00:00")
                  : "Selecione um dia"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {/* Events */}
                  {selectedEvents.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#8B7A6B] mb-2">Eventos</p>
                      <div className="space-y-2">
                        {selectedEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleEditEvent(event)}
                            className="rounded-lg border p-2.5 cursor-pointer hover:shadow-md transition-shadow"
                            style={{ borderLeftColor: event.color, borderLeftWidth: 3 }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-[#3D2519]">{event.title}</span>
                              <Badge className={eventTypeBadgeColors[event.event_type]}>
                                {eventTypeLabels[event.event_type]}
                              </Badge>
                            </div>
                            {event.event_time && (
                              <p className="text-xs text-[#8B7A6B]">
                                {event.event_time.slice(0, 5)}
                                {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-xs text-[#8B7A6B] mt-1 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {selectedOrders.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#8B7A6B] mb-2">Entregas</p>
                      <div className="space-y-2">
                        {selectedOrders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-lg border border-[#D4C4B0] p-2.5 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/service-orders/${order.id}`)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono text-[#8B7A6B]">{order.order_number}</span>
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-[#3D2519]">
                              {order.customers?.full_name || "Cliente"}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge className={priorityColors[order.priority]}>
                                {order.priority}
                              </Badge>
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
                    </div>
                  )}

                  {/* Financial */}
                  {selectedFinancial.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#8B7A6B] mb-2">Financeiro</p>
                      <div className="space-y-2">
                        {selectedFinancial.map((fin) => (
                          <div
                            key={fin.id}
                            className="rounded-lg border p-2.5"
                            style={{
                              borderLeftColor: fin.transaction_type === "receita" ? "#10B981" : "#EF4444",
                              borderLeftWidth: 3,
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-[#3D2519]">{fin.category}</span>
                              <Badge className={fin.status === "pago" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                {fin.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: fin.transaction_type === "receita" ? "#059669" : "#DC2626" }}>
                              {formatCurrency(fin.amount)}
                            </p>
                            <p className="text-[10px] text-[#8B7A6B] mt-0.5 truncate">{fin.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {selectedOrders.length === 0 && selectedFinancial.length === 0 && selectedEvents.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-[#8B7A6B]">Nenhum compromisso para este dia</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleOpenNewEvent(selectedDate!)}
                      >
                        + Adicionar evento
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[#8B7A6B]">
                    Clique em um dia no calendário para ver os detalhes.
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

      {/* Event Dialog */}
      <EventDialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        onSave={handleEventSaved}
        selectedDate={selectedDate ?? formatDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
        editingEvent={editingEvent}
      />
    </div>
  );
}
