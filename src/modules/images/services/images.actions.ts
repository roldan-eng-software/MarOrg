"use server";

import { createClient } from "@/lib/supabase/server";
import type { BudgetImage } from "@/types";

export async function listBudgetImages(budgetId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budget_images")
    .select("*")
    .eq("budget_id", budgetId)
    .order("sort_order");

  if (error) {
    console.error("Error listing budget images:", error.message);
    return [] as BudgetImage[];
  }
  return data as BudgetImage[];
}

export async function uploadBudgetImage(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const file = formData.get("file") as File;
  const budgetId = formData.get("budgetId") as string;
  const description = formData.get("description") as string | null;

  if (!file || !budgetId) {
    throw new Error("Dados incompletos para upload");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${budgetId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError.message);
    throw new Error("Erro ao fazer upload da imagem");
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from("budget_images")
    .insert({
      budget_id: budgetId,
      image_url: urlData.publicUrl,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving image record:", error.message);
    throw new Error("Erro ao salvar registro da imagem");
  }

  return data as BudgetImage;
}

export async function deleteBudgetImage(id: string) {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("budget_images")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error("Imagem não encontrada");
  }

  // Extract storage path from URL
  const urlParts = image.image_url.split("/documents/");
  if (urlParts.length > 1) {
    await supabase.storage.from("documents").remove([urlParts[1]]);
  }

  const { error } = await supabase
    .from("budget_images")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting image:", error.message);
    throw new Error("Erro ao excluir imagem");
  }

  return { id };
}
