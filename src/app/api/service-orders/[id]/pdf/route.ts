import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateServiceOrderPDF } from "@/modules/documents/services/os-pdf.service";
import { getCompanySettings } from "@/modules/documents/services/company-settings";
import { getServiceOrder } from "@/modules/service-orders/services/service-orders.actions";

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
    const order = await getServiceOrder(id);
    const companySettings = await getCompanySettings();

    const buffer = await generateServiceOrderPDF({
      order,
      items: order.items,
      customer: order.customers,
      budgetNotes: order.budgets?.notes_client,
      companySettings,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${order.order_number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
