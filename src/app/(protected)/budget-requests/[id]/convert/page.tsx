"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { CostBreakdown } from "@/components/cost-breakdown";
import { formatDate } from "@/lib/utils/format";
import {
  getBudgetRequest,
  getBudgetRequestEstimation,
  convertBudgetRequest,
} from "@/modules/budget-requests/services/budget-requests.actions";
import type { BudgetRequest, TemplateCostBreakdown } from "@/types";

const MATERIAL_LABELS: Record<string, string> = {
  mdf_branco: "MDF branco",
  mdf_madeira: "MDF cor madeira",
  mdf_escura: "MDF cor escura",
  laca: "Laca",
  nao_sei: "Não sabe",
};

export default function ConvertBudgetRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<BudgetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [estimation, setEstimation] = useState<{
    breakdown: TemplateCostBreakdown | null;
    templateName: string | null;
    loading: boolean;
  }>({ breakdown: null, templateName: null, loading: true });

  useEffect(() => {
    getBudgetRequest(id)
      .then(setRequest)
      .finally(() => setLoading(false));

    getBudgetRequestEstimation(id)
      .then(({ breakdown, templateName }) =>
        setEstimation({ breakdown, templateName, loading: false })
      )
      .catch(() => setEstimation((s) => ({ ...s, loading: false })));
  }, [id]);

  async function handleConvert() {
    try {
      setConverting(true);
      const budgetId = await convertBudgetRequest(id);
      showToast("Orçamento criado com sucesso!", "success");
      router.push(`/budgets/${budgetId}/edit`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao converter",
        "error"
      );
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-[#8B7A6B]">Carregando...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-[#8B7A6B]">Pedido não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Converter em Orçamento</h1>
        <Button variant="ghost" onClick={() => router.push("/budget-requests")}>
          ← Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{request.request_number}</CardTitle>
            <Badge variant="warning">Pendente</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#3D2519]">Cliente</p>
            <p className="text-[#8B7A6B]">{request.customer_name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-[#3D2519]">WhatsApp</p>
              <p className="text-[#8B7A6B]">{request.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3D2519]">E-mail</p>
              <p className="text-[#8B7A6B]">{request.customer_email || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Canal preferido</p>
              <p className="text-[#8B7A6B]">
                {request.preferred_channel === "whatsapp" ? "WhatsApp" : "E-mail"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Data do pedido</p>
              <p className="text-[#8B7A6B]">{formatDate(request.created_at)}</p>
            </div>
          </div>

          <hr className="border-[#D4C4B0]" />

          <div>
            <p className="text-sm font-medium text-[#3D2519]">Tipo de móvel</p>
            <p className="text-[#8B7A6B]">
              {request.furniture_type === "Outro" && request.furniture_other
                ? request.furniture_other
                : request.furniture_type}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3D2519]">Ambiente</p>
            <p className="text-[#8B7A6B]">{request.environment}</p>
          </div>
          {(request.width_cm || request.height_cm || request.depth_cm) && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Medidas (cm)</p>
              <p className="text-[#8B7A6B]">
                {request.width_cm && `L: ${request.width_cm}`}
                {request.height_cm && ` · A: ${request.height_cm}`}
                {request.depth_cm && ` · P: ${request.depth_cm}`}
              </p>
            </div>
          )}

          {request.materials.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Materiais</p>
              <p className="text-[#8B7A6B]">{request.materials.join(", ")}</p>
            </div>
          )}

          {request.hardware.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Ferragens</p>
              <p className="text-[#8B7A6B]">{request.hardware.join(", ")}</p>
            </div>
          )}

          {request.additional_description && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Descrição adicional</p>
              <p className="text-[#8B7A6B] whitespace-pre-wrap">{request.additional_description}</p>
            </div>
          )}

          {request.budget_range && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Faixa de orçamento</p>
              <p className="text-[#8B7A6B]">{request.budget_range}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Projeto 3D</p>
              <p className="text-[#8B7A6B]">
                {request.needs_3d_project ? "Sim" : "Não"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Visita técnica</p>
              <p className="text-[#8B7A6B]">
                {request.needs_technical_visit ? "Sim" : "Não"}
              </p>
            </div>
          </div>

          {estimation.templateName && (
            <div>
              <p className="text-sm font-medium text-[#3D2519]">Template utilizado</p>
              <p className="text-[#8B7A6B]">{estimation.templateName}</p>
            </div>
          )}

          <CostBreakdown breakdown={estimation.breakdown} loading={estimation.loading} />

          <Button
            onClick={handleConvert}
            disabled={converting}
            className="w-full"
          >
            {converting
              ? "Convertendo..."
              : "Gerar orçamento com base neste pedido"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}