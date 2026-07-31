import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBudgetPDF } from "@/modules/documents/services/pdf.service";
import { getCompanySettings } from "@/modules/documents/services/company-settings";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: shareToken, error: tokenError } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", token)
    .eq("entity_type", "budget")
    .single();

  if (tokenError || !shareToken) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });
  }

  if (new Date(shareToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expirado" }, { status: 410 });
  }

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*, customers(*)")
    .eq("id", shareToken.entity_id)
    .single();

  if (budgetError || !budget) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("budget_items")
    .select("*")
    .eq("budget_id", shareToken.entity_id)
    .order("sort_order");

  const { data: images } = await supabase
    .from("budget_images")
    .select("*")
    .eq("budget_id", shareToken.entity_id)
    .order("sort_order");

  try {
    const companySettings = await getCompanySettings();

    const buffer = await generateBudgetPDF({
      budget: {
        ...budget,
        items: items || [],
        customers: budget.customers as Record<string, unknown>,
      },
      items: items || [],
      customer: budget.customers,
      images: images || [],
      companySettings,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${budget.budget_number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}