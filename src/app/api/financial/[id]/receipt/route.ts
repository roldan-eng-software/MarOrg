import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReceiptPDF } from "@/modules/documents/services/receipt-pdf.service";

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
    const { data: transaction, error } = await supabase
      .from("financial_transactions")
      .select(`
        id, description, amount, category, payment_method,
        paid_date, due_date, notes, service_order_id, budget_id,
        service_orders!left(order_number, customer_id, customers(full_name, phone, cpf_cnpj)),
        budgets!left(budget_number)
      `)
      .eq("id", id)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soArray = transaction.service_orders as any as Array<{
      order_number: string | null;
      customers: { full_name: string; phone: string; cpf_cnpj: string | null } | null;
    }> | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const budgetArray = transaction.budgets as any as Array<{
      budget_number: string | null;
    }> | null;

    const soData = soArray?.[0] ?? null;
    const budgetData = budgetArray?.[0] ?? null;

    const customer = soData?.customers ?? null;
    const orderNumber = soData?.order_number ?? null;
    const budgetNumber = budgetData?.budget_number ?? null;

    const buffer = await generateReceiptPDF({
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      category: transaction.category,
      payment_method: transaction.payment_method,
      paid_date: transaction.paid_date,
      due_date: transaction.due_date,
      notes: transaction.notes,
      customer,
      order_number: orderNumber,
      budget_number: budgetNumber,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="recibo-${transaction.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate receipt PDF" },
      { status: 500 }
    );
  }
}
