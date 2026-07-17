"use server";

import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types";

export async function listCustomersServer(search?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("*")
    .eq("active", true)
    .order("full_name");

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Customer[];
}

export async function getCustomerServer(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createCustomerServer(
  data: Omit<Customer, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({ ...data, created_by: user?.id ?? "" })
    .select()
    .single();

  if (error) throw error;
  return customer as Customer;
}

export async function updateCustomerServer(
  id: string,
  data: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return customer as Customer;
}

export async function deleteCustomerServer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
}
