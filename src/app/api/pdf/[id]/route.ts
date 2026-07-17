import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBudgetPDF } from "@/modules/documents/services/pdf.service";
import { getBudget } from "@/modules/budgets/services/budgets.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const budget = await getBudget(id);

    const { data: images } = await supabase
      .from("budget_images")
      .select("*")
      .eq("budget_id", id)
      .order("sort_order");

    const buffer = await generateBudgetPDF({
      budget,
      items: budget.items,
      customer: budget.customers,
      images: images || [],
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${budget.budget_number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
