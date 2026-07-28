"use server";

import { createClient } from "@/lib/supabase/server";
import type { PaymentInterestRate } from "@/types";

export async function getInterestRates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_interest_rates")
    .select("*")
    .order("payment_type");

  if (error) {
    console.error("Error fetching interest rates:", error.message);
    return [] as PaymentInterestRate[];
  }

  return data as PaymentInterestRate[];
}

export async function getActiveInterestRates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_interest_rates")
    .select("*")
    .eq("active", true)
    .order("payment_type");

  if (error) {
    console.error("Error fetching active interest rates:", error.message);
    return [] as PaymentInterestRate[];
  }

  return data as PaymentInterestRate[];
}

export async function updateInterestRate(id: string, monthlyRate: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_interest_rates")
    .update({ monthly_rate: monthlyRate })
    .eq("id", id);

  if (error) throw new Error("Erro ao atualizar taxa de juros");
  return { id };
}
