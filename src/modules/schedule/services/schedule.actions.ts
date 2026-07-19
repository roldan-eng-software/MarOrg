"use server";

import { createClient } from "@/lib/supabase/server";
import type { ScheduleEvent } from "@/types";

export async function listScheduleEvents(year: number, month: number) {
  const supabase = await createClient();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("schedule_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date")
    .order("event_time");

  if (error) {
    console.error("Error listing schedule events:", error.message);
    return [] as ScheduleEvent[];
  }

  return data as ScheduleEvent[];
}

export async function listScheduleEventsByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schedule_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date")
    .order("event_time");

  if (error) {
    console.error("Error listing schedule events:", error.message);
    return [] as ScheduleEvent[];
  }

  return data as ScheduleEvent[];
}

export async function createScheduleEvent(
  data: Omit<ScheduleEvent, "id" | "created_by" | "created_at" | "updated_at">
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: event, error } = await supabase
    .from("schedule_events")
    .insert({
      ...data,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error("Erro ao criar evento");

  return event as ScheduleEvent;
}

export async function updateScheduleEvent(
  id: string,
  data: Partial<Pick<ScheduleEvent, "title" | "description" | "event_date" | "event_time" | "end_time" | "event_type" | "color" | "entity_type" | "entity_id" | "customer_id" | "completed">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_events")
    .update(data)
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar evento");

  return { id };
}

export async function deleteScheduleEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_events")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Erro ao excluir evento");

  return { id };
}

export async function toggleEventCompleted(id: string, completed: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_events")
    .update({ completed })
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar evento");

  return { id };
}

export async function getFinancialDueDates(year: number, month: number) {
  const supabase = await createClient();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("financial_transactions")
    .select("id, transaction_type, category, description, amount, due_date, status, service_order_id")
    .gte("due_date", startDate)
    .lte("due_date", endDate)
    .neq("status", "cancelado")
    .order("due_date");

  if (error) {
    console.error("Error listing financial due dates:", error.message);
    return [];
  }

  return data;
}
