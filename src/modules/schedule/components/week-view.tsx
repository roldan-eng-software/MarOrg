"use client";

import { useRouter } from "next/navigation";
import type { ScheduleEvent } from "@/types";

interface WeekViewProps {
  weekStart: Date;
  orders: Array<{
    id: string;
    order_number: string;
    status: string;
    priority: string;
    estimated_delivery: string;
    total_amount: number;
    responsible: string | null;
    customers: { full_name: string } | null;
  }>;
  financialDueDates: Array<{
    id: string;
    transaction_type: string;
    category: string;
    description: string;
    amount: number;
    due_date: string;
    status: string;
  }>;
  events: ScheduleEvent[];
  onDateClick: (date: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const eventTypeLabels: Record<string, string> = {
  reuniao: "Reunião",
  visita: "Visita",
  followup: "Follow-up",
  outro: "Outro",
};

const statusColors: Record<string, string> = {
  pendente: "#EAB308",
  em_producao: "#3B82F6",
  acabamento: "#A855F7",
  pronto: "#22C55E",
  entregue: "#10B981",
  cancelada: "#EF4444",
};

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDates(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isToday(date: Date) {
  const today = new Date();
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

export function WeekView({
  weekStart,
  orders,
  financialDueDates,
  events,
  onDateClick,
  onEventClick,
}: WeekViewProps) {
  const router = useRouter();
  const weekDates = getWeekDates(weekStart);

  function getOrdersForDate(dateKey: string) {
    return orders.filter((o) => o.estimated_delivery === dateKey);
  }

  function getFinancialForDate(dateKey: string) {
    return financialDueDates.filter((f) => f.due_date === dateKey);
  }

  function getEventsForDate(dateKey: string) {
    return events.filter((e) => e.event_date === dateKey);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header - Days */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDates.map((date, i) => {
            const dateKey = formatDateKey(date);
            const today = isToday(date);
            return (
              <div
                key={dateKey}
                onClick={() => onDateClick(dateKey)}
                className={`text-center py-2 rounded-t cursor-pointer transition-colors ${
                  today
                    ? "bg-[#5B3A29] text-white"
                    : "bg-[#F5F0EB] text-[#3D2519] hover:bg-[#E8DED4]"
                }`}
              >
                <p className="text-xs font-medium">{DAY_NAMES[i]}</p>
                <p className={`text-lg font-bold ${today ? "text-white" : ""}`}>
                  {date.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grid - Hours x Days */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date) => {
            const dateKey = formatDateKey(date);
            const dayOrders = getOrdersForDate(dateKey);
            const dayFinancial = getFinancialForDate(dateKey);
            const dayEvents = getEventsForDate(dateKey);

            return (
              <div
                key={dateKey}
                className="border border-[#D4C4B0] rounded-b min-h-[500px] p-1 space-y-1"
              >
                {/* Events with time */}
                {dayEvents
                  .filter((e) => e.event_time)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="rounded px-1.5 py-1 text-[10px] cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: event.color + "20", borderLeft: `3px solid ${event.color}` }}
                    >
                      <p className="font-medium truncate" style={{ color: event.color }}>
                        {event.event_time?.slice(0, 5)} {event.title}
                      </p>
                    </div>
                  ))}

                {/* Orders */}
                {dayOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/service-orders/${order.id}`)}
                    className="rounded px-1.5 py-1 text-[10px] cursor-pointer hover:shadow-sm transition-shadow"
                    style={{
                      backgroundColor: (statusColors[order.status] ?? "#6B7280") + "20",
                      borderLeft: `3px solid ${statusColors[order.status] ?? "#6B7280"}`,
                    }}
                  >
                    <p className="font-medium text-[#3D2519] truncate">{order.order_number}</p>
                    <p className="text-[#8B7A6B] truncate">{order.customers?.full_name}</p>
                  </div>
                ))}

                {/* Financial */}
                {dayFinancial.map((fin) => (
                  <div
                    key={fin.id}
                    className="rounded px-1.5 py-1 text-[10px]"
                    style={{
                      backgroundColor: fin.transaction_type === "receita" ? "#10B98120" : "#EF444420",
                      borderLeft: `3px solid ${fin.transaction_type === "receita" ? "#10B981" : "#EF4444"}`,
                    }}
                  >
                    <p
                      className="font-medium truncate"
                      style={{ color: fin.transaction_type === "receita" ? "#059669" : "#DC2626" }}
                    >
                      {fin.category}
                    </p>
                    <p className="text-[#8B7A6B] truncate">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        Number(fin.amount)
                      )}
                    </p>
                  </div>
                ))}

                {/* Events without time */}
                {dayEvents
                  .filter((e) => !e.event_time)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="rounded px-1.5 py-1 text-[10px] cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: event.color + "20", borderLeft: `3px solid ${event.color}` }}
                    >
                      <p className="font-medium truncate" style={{ color: event.color }}>
                        {eventTypeLabels[event.event_type]}: {event.title}
                      </p>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
