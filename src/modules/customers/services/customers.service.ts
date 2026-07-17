import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types";

export async function listCustomers(search?: string) {
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

export async function getCustomer(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(
  data: Omit<Customer, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return customer as Customer;
}

export async function updateCustomer(
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

export async function deleteCustomer(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
}
