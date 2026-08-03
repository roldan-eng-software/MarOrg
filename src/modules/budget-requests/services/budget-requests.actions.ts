"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { estimateBudgetRequestCost } from "@/modules/pricing/services/pricing.engine";
import type { BudgetRequest, TemplateCostBreakdown } from "@/types";

export async function getPendingRequests(): Promise<{ requests: BudgetRequest[]; total: number }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { requests: [], total: 0 };
  }

  const { data, error, count } = await supabase
    .from("budget_requests")
    .select("*", { count: "exact" })
    .eq("status", "pendente")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error.message);
    return { requests: [], total: 0 };
  }

  return {
    requests: (data || []) as BudgetRequest[],
    total: count || 0,
  };
}

export async function getBudgetRequest(id: string): Promise<BudgetRequest | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budget_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching budget request:", error.message);
    return null;
  }

  return data as BudgetRequest;
}

export async function getBudgetRequestEstimation(
  id: string
): Promise<{ breakdown: TemplateCostBreakdown | null; templateName: string | null }> {
  const supabase = await createClient();

  const { data: req, error } = await supabase
    .from("budget_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !req) {
    return { breakdown: null, templateName: null };
  }

  const estimation = await estimateBudgetRequestCost(req as BudgetRequest);

  if (estimation.breakdown.totalCost === 0) {
    return { breakdown: null, templateName: null };
  }

  return { breakdown: estimation.breakdown, templateName: estimation.templateName };
}

export async function convertBudgetRequest(id: string): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  const { data: req, error: reqError } = await supabase
    .from("budget_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError || !req) {
    throw new Error("Pedido não encontrado");
  }

  if (req.status !== "pendente") {
    throw new Error("Pedido já foi convertido");
  }

  const adminClient = createAdminClient();

  const { data: existingCustomer } = await adminClient
    .from("customers")
    .select("id, phone")
    .eq("phone", req.customer_phone)
    .maybeSingle();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error: customerError } = await adminClient
      .from("customers")
      .insert({
        full_name: req.customer_name,
        phone: req.customer_phone,
        email: req.customer_email || null,
        cpf_cnpj: req.customer_cpf || null,
        address_zip: req.address_zip || null,
        address_street: req.address_street || null,
        address_number: req.address_number || null,
        address_complement: req.address_complement || null,
        address_neighborhood: req.address_neighborhood || null,
        address_city: req.address_city || null,
        address_state: req.address_state || null,
        active: true,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (customerError) {
      throw new Error("Erro ao criar cliente");
    }

    customerId = newCustomer.id;
  }

  const budgetNumber = await generateBudgetNumberInternal(adminClient);

  const furnitureDescription =
    req.furniture_type === "Outro" && req.furniture_other
      ? `${req.furniture_other} - ${req.environment}`
      : `${req.furniture_type} - ${req.environment}`;

  const materialStr = req.materials.length > 0 ? req.materials.join(", ") : null;
  const hardwareStr = req.hardware.length > 0 ? req.hardware.join(", ") : null;

  let notesClient = req.additional_description || "";

  const contextMap: Record<string, string> = {
    novo: "Ambiente novo / construção",
    substituir: "Substituir móveis existentes",
    reforma: "Reforma do ambiente",
  };
  if (req.project_context) {
    notesClient += (notesClient ? "\n" : "") + `Contexto do projeto: ${contextMap[req.project_context] || req.project_context}.`;
  }

  if (req.finish_color) {
    notesClient += (notesClient ? "\n" : "") + `Cor/tom do acabamento: ${req.finish_color}.`;
  }

  const propertyMap: Record<string, string> = {
    apartamento: "Apartamento",
    casa: "Casa",
    comercio: "Comércio",
  };
  const addressParts = [
    req.address_street ? `${req.address_street}, ${req.address_number || "s/n"}` : null,
    req.address_complement,
    req.address_neighborhood,
    req.address_city,
    req.address_state,
    req.address_zip,
  ].filter(Boolean);

  if (addressParts.length > 0) {
    notesClient +=
      (notesClient ? "\n" : "") +
      `Endereço de instalação: ${addressParts.join(", ")}.`;
  }

  if (req.property_type) {
    notesClient +=
      (notesClient ? "\n" : "") +
      `Tipo de imóvel: ${propertyMap[req.property_type] || req.property_type}.`;
  }

  if (req.budget_range && req.budget_range !== "Prefiro não informar") {
    notesClient += (notesClient ? "\n\n" : "") + `Faixa de orçamento: ${req.budget_range}`;
  }

  if (req.needs_3d_project) {
    notesClient += (notesClient ? "\n" : "") + "Cliente solicitou projeto 3D técnico.";
  }

  if (req.needs_technical_visit) {
    notesClient += (notesClient ? "\n" : "") + "Cliente solicitou visita técnica.";
  }

  if (hardwareStr) {
    notesClient += (notesClient ? "\n\n" : "") + `Preferências de ferragens: ${hardwareStr}`;
  }

  const estimation = await estimateBudgetRequestCost(req);
  const rawMaterialCost = estimation.breakdown.totalCost;
  const hardwareItems = estimation.breakdown.details.hardwareItems;

  const { data: budget, error: budgetError } = await adminClient
    .from("budgets")
    .insert({
      budget_number: budgetNumber,
      customer_id: customerId,
      status: "rascunho",
      version: 1,
      validity_days: 30,
      delivery_days: 30,
      production_days: 0,
      warranty_months: null,
      notes_internal: `Pedido automático via formulário online (${req.request_number})`,
      notes_client: notesClient || null,
      total_amount: 0,
      created_by: user.id,
      raw_material_cost: rawMaterialCost,
      overhead_cost: 0,
      profit_margin: 0,
      payment_installments: [],
      payment_types: [],
      deposit_percentage: 0,
      installment_count: 1,
    })
    .select("id")
    .single();

  if (budgetError) {
    throw new Error("Erro ao criar orçamento");
  }

  const { error: itemError } = await adminClient.from("budget_items").insert({
    budget_id: budget.id,
    item_type: "mobiliario",
    description: furnitureDescription,
    material: materialStr,
    width_cm: req.width_cm || null,
    depth_cm: req.depth_cm || null,
    height_cm: req.height_cm || null,
    unit: "un",
    quantity: 1,
    unit_price: 0,
    discount: 0,
    total_price: 0,
    notes: hardwareStr || null,
    sort_order: 0,
  });

  if (itemError) {
    throw new Error("Erro ao criar item do orçamento");
  }

  if (rawMaterialCost > 0) {
    const estimatedItems = hardwareItems.map((item, index) => ({
      budget_id: budget.id,
      item_type: "servico" as const,
      description: `${item.quantity}x ${item.name} (custo estimado)`,
      material: null,
      width_cm: null,
      depth_cm: null,
      height_cm: null,
      unit: "un",
      quantity: item.quantity,
      unit_price: item.quantity > 0 ? item.cost / item.quantity : 0,
      discount: 0,
      total_price: item.cost,
      notes: null,
      sort_order: index + 1,
    }));

    if (estimatedItems.length > 0) {
      const { error: estimatedError } = await adminClient
        .from("budget_items")
        .insert(estimatedItems);

      if (estimatedError) {
        console.error("Erro ao criar itens estimados:", estimatedError.message);
      }
    }
  }

  if (req.image_urls && req.image_urls.length > 0) {
    const imageInserts = (req.image_urls as string[]).map((url: string, index: number) => ({
      budget_id: budget.id,
      image_url: url,
      description: `Foto do ambiente (${index + 1})`,
      sort_order: index,
    }));

    await adminClient.from("budget_images").insert(imageInserts);
  }

  await supabase
    .from("budget_requests")
    .update({
      status: "convertido",
      converted_at: new Date().toISOString(),
      converted_budget_id: budget.id,
    })
    .eq("id", id);

  return budget.id;
}

async function generateBudgetNumberInternal(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  const year = new Date().getFullYear();

  const { data } = await supabase
    .from("budgets")
    .select("budget_number")
    .like("budget_number", `ORC-${year}-%`)
    .order("budget_number", { ascending: false })
    .limit(1);

  if (data?.[0]) {
    const lastNumber = parseInt(data[0].budget_number.split("-")[2], 10);
    return `ORC-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
  }

  return `ORC-${year}-0001`;
}

export async function uploadRequestImage(
  requestId: string,
  file: File
): Promise<{ url: string } | null> {
  try {
    const adminClient = createAdminClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `requests/${requestId}/${Date.now()}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();

    const { error } = await adminClient.storage
      .from("documents")
      .upload(filePath, new Uint8Array(fileBuffer), {
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data: urlData } = adminClient.storage
      .from("documents")
      .getPublicUrl(filePath);

    const url = urlData.publicUrl;

    const { data: req } = await adminClient
      .from("budget_requests")
      .select("image_urls")
      .eq("id", requestId)
      .single();

    const current = (req?.image_urls as string[]) || [];
    const updated = current.includes(url) ? current : [...current, url];

    await adminClient
      .from("budget_requests")
      .update({ image_urls: updated })
      .eq("id", requestId);

    return { url };
  } catch {
    return null;
  }
}