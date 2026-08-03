import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { budgetRequestSchema } from "@/lib/validations/budget-request";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

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

async function generateRequestNumber(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const now = new Date();
  const prefix = `REQ-${months[now.getMonth()]}-`;

  const { data } = await supabase
    .from("budget_requests")
    .select("request_number")
    .like("request_number", `${prefix}%`)
    .order("request_number", { ascending: false })
    .limit(1);

  const sequence = data?.[0]
    ? String(Number(data[0].request_number.split("-")[2]) + 1).padStart(3, "0")
    : "001";

  return `${prefix}${sequence}`;
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
    const parsed = budgetRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    const requestNumber = await generateRequestNumber(supabase);

    const { data: created, error } = await supabase
      .from("budget_requests")
      .insert({
        request_number: requestNumber,
        status: "pendente",
        customer_name: data.nome.trim(),
        customer_email: data.email?.trim() || null,
        customer_phone: data.whatsapp.replace(/\D/g, ""),
        customer_cpf: data.customer_cpf?.trim() || null,
        preferred_channel: data.canal_preferido,
        furniture_type: data.tipo_movel,
        furniture_other: data.tipo_movel === "Outro" ? data.tipo_movel_outro?.trim() || null : null,
        environment: data.ambiente.trim(),
        width_cm: data.largura_cm,
        height_cm: data.altura_cm,
        depth_cm: data.profundidade_cm,
        materials: data.materiais,
        hardware: data.ferragens,
        finish_color: data.finish_color?.trim() || null,
        project_context: data.project_context,
        additional_description: data.descricao?.trim() || null,
        budget_range: data.faixa_orcamento || null,
        needs_3d_project: data.projeto_3d,
        needs_technical_visit: data.visita_tecnica,
        address_zip: data.address_zip || null,
        address_street: data.address_street?.trim() || null,
        address_number: data.address_number?.trim() || null,
        address_complement: data.address_complement?.trim() || null,
        address_neighborhood: data.address_neighborhood?.trim() || null,
        address_city: data.address_city?.trim() || null,
        address_state: data.address_state?.toUpperCase().trim() || null,
        property_type: data.property_type,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "Erro ao salvar pedido" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      protocolo: created.request_number,
      requestId: created.id,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  let query = supabase
    .from("budget_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }

  return NextResponse.json({ requests: data || [], total: count || 0 });
}