import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReportPDF } from "@/modules/documents/services/report-pdf.service";
import { getCompanySettings } from "@/modules/documents/services/company-settings";
import {
  getRevenueReport,
  getBudgetReport,
  getServiceOrderReport,
  getInventoryReport,
  getCustomerReport,
} from "@/modules/reports/services/reports.actions";
import type { ReportFilters } from "@/modules/reports/services/reports.actions";

const REPORT_NAMES: Record<string, string> = {
  revenue: "faturamento",
  budgets: "orcamentos",
  orders: "ordens-de-servico",
  inventory: "estoque",
  customers: "clientes",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { type } = await params;
  const { searchParams } = new URL(request.url);

  const filters: ReportFilters = {
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  if (!REPORT_NAMES[type]) {
    return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
  }

  try {
    const companySettings = await getCompanySettings();
    let data;

    switch (type) {
      case "revenue":
        data = await getRevenueReport(filters);
        break;
      case "budgets":
        data = await getBudgetReport(filters);
        break;
      case "orders":
        data = await getServiceOrderReport(filters);
        break;
      case "inventory":
        data = await getInventoryReport(filters);
        break;
      case "customers":
        data = await getCustomerReport(filters);
        break;
      default:
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const buffer = await generateReportPDF(type as "revenue" | "budgets" | "orders" | "inventory" | "customers", data, companySettings);

    const fileName = `relatorio-${REPORT_NAMES[type]}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
