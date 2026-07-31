import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { budget_id, budget_number, phone } = body;

    if (!budget_id) {
      return NextResponse.json({ error: "ID do orçamento é obrigatório" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: budget, error } = await supabase
      .from("budgets")
      .select("id, budget_number, customers!inner(phone)")
      .eq("id", budget_id)
      .in("status", ["em_analise", "aprovado", "recusado", "vencido", "revisado", "concluido"])
      .single();

    if (error || !budget) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    if (budget_number) {
      const sanitizedNumber = budget_number.trim().replace(/[^A-Za-z0-9\-]/g, "").toUpperCase();
      if (budget.budget_number !== sanitizedNumber) {
        return NextResponse.json({ error: "Dados não autorizado" }, { status: 403 });
      }
    }

    if (phone) {
      const sanitizedPhone = phone.replace(/\D/g, "");
      const cust = Array.isArray(budget.customers) ? budget.customers[0] : (budget.customers as Record<string, unknown>);
      const customerPhone = ((cust as { phone?: string })?.phone || "").replace(/\D/g, "");
      if (!customerPhone.includes(sanitizedPhone) && !sanitizedPhone.includes(customerPhone)) {
        return NextResponse.json({ error: "Dados não autorizado" }, { status: 403 });
      }
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("share_tokens")
      .insert({
        entity_type: "budget",
        entity_id: budget_id,
      })
      .select("token")
      .single();

    if (tokenError) {
      return NextResponse.json({ error: "Erro ao gerar link" }, { status: 500 });
    }

    return NextResponse.json({
      token: tokenData.token,
      url: `${request.nextUrl.origin}/api/shared/pdf/${tokenData.token}`,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const budgetNumber = searchParams.get("budget_number");
  const phone = searchParams.get("phone");

  if (!budgetNumber && !phone) {
    return NextResponse.json(
      { error: "Informe o número do orçamento ou telefone" },
      { status: 400 }
    );
  }

  // Input validation: sanitize
  const sanitizedBudgetNumber = budgetNumber?.trim().replace(/[^A-Za-z0-9\-]/g, "") || null;
  const sanitizedPhone = phone?.trim().replace(/\D/g, "") || null;

  if (!sanitizedBudgetNumber && !sanitizedPhone) {
    return NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("budgets")
    .select("*, customers!inner(full_name, phone), budget_items(*)")
    .in("status", ["em_analise", "aprovado", "recusado", "vencido", "revisado", "concluido"])
    .order("created_at", { ascending: false });

  if (sanitizedBudgetNumber) {
    query = query.eq("budget_number", sanitizedBudgetNumber.toUpperCase());
  }

  const { data: budgets, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar orçamentos" }, { status: 500 });
  }

  let filteredBudgets = budgets || [];

  if (sanitizedPhone && !sanitizedBudgetNumber) {
    filteredBudgets = filteredBudgets.filter((b) => {
      const customer = b.customers as { phone: string } | null;
      if (!customer) return false;
      const customerPhoneDigits = customer.phone.replace(/\D/g, "");
      return customerPhoneDigits.includes(sanitizedPhone) || sanitizedPhone.includes(customerPhoneDigits);
    });
  }

  const limitedBudgets = filteredBudgets.slice(0, 5);

  const formattedBudgets = limitedBudgets.map((b) => ({
    id: b.id,
    budget_number: b.budget_number,
    status: b.status,
    total_amount: Number(b.total_amount),
    validity_days: b.validity_days,
    delivery_days: b.delivery_days,
    notes_client: b.notes_client,
    payment_conditions: b.payment_conditions,
    payment_types: b.payment_types,
    payment_installments: b.payment_installments,
    created_at: b.created_at,
    sent_at: b.sent_at,
    customers: b.customers,
    items: (b.budget_items || []).map((item: Record<string, unknown>) => ({
      id: item.id,
      description: item.description,
      material: item.material,
      width_cm: item.width_cm,
      depth_cm: item.depth_cm,
      height_cm: item.height_cm,
      finish: item.finish,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
    })),
  }));

  return NextResponse.json({ budgets: formattedBudgets });
}
