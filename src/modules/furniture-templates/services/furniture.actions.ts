"use server";

import { createClient } from "@/lib/supabase/server";
import type { FurnitureTemplate } from "@/types";

export async function listFurnitureTemplates(category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("furniture_templates")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error listing furniture templates:", error.message);
    return [] as FurnitureTemplate[];
  }
  return data as FurnitureTemplate[];
}

export async function listAllFurnitureTemplates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("furniture_templates")
    .select("*")
    .order("category")
    .order("name");

  if (error) {
    console.error("Error listing all furniture templates:", error.message);
    return [] as FurnitureTemplate[];
  }
  return data as FurnitureTemplate[];
}

export async function getFurnitureTemplate(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("furniture_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting furniture template:", error.message);
    throw new Error("Modelo não encontrado");
  }
  return data as FurnitureTemplate;
}

export async function createFurnitureTemplate(
  template: Omit<FurnitureTemplate, "id" | "created_at" | "updated_at" | "created_by">
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("furniture_templates")
    .insert({
      ...template,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating furniture template:", error.message);
    throw new Error("Erro ao criar modelo");
  }
  return data as FurnitureTemplate;
}

export async function updateFurnitureTemplate(
  id: string,
  template: Partial<Omit<FurnitureTemplate, "id" | "created_at" | "updated_at" | "created_by">>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("furniture_templates")
    .update(template)
    .eq("id", id);

  if (error) {
    console.error("Error updating furniture template:", error.message);
    throw new Error("Erro ao atualizar modelo");
  }
  return { id };
}

export async function deleteFurnitureTemplate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("furniture_templates")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting furniture template:", error.message);
    throw new Error("Erro ao remover modelo");
  }
  return { id };
}
