import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const budgetNumber = searchParams.get("budget_number");
  const phone = searchParams.get("phone");

  if (!budgetNumber && !phone) {
    return NextResponse.json(
      { error: "Informe o número do orçamento ou telefone" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("*, customers(full_name, phone), budget_items(*)")
    .in("status", ["enviado", "em_analise", "aprovado"])
    .order("created_at", { ascending: false });

  if (budgetNumber) {
    query = query.eq("budget_number", budgetNumber.toUpperCase());
  }

  const { data: budgets, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar orçamentos" }, { status: 500 });
  }

  // Filter by phone if provided (after fetching, since phone is in customers table)
  let filteredBudgets = budgets || [];

  if (phone && !budgetNumber) {
    const phoneDigits = phone.replace(/\D/g, "");
    filteredBudgets = filteredBudgets.filter((b) => {
      const customer = b.customers as { phone: string } | null;
      if (!customer) return false;
      const customerPhoneDigits = customer.phone.replace(/\D/g, "");
      return customerPhoneDigits.includes(phoneDigits) || phoneDigits.includes(customerPhoneDigits);
    });
  }

  // Format the response
  const formattedBudgets = filteredBudgets.map((b) => ({
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
