"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/format";
import type { BudgetRequest } from "@/types";

export default function BudgetRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/budget-requests");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      showToast("Erro ao carregar pedidos", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-[#8B7A6B]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Pedidos de Orçamento Online</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          ← Voltar ao Dashboard
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-[#8B7A6B]">Nenhum pedido de orçamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#5B3A29]">{req.request_number}</span>
                      <Badge variant={req.status === "pendente" ? "warning" : "success"}>
                        {req.status === "pendente" ? "Pendente" : "Convertido"}
                      </Badge>
                    </div>
                    <p className="text-[#3D2519] font-medium">{req.customer_name}</p>
                    <p className="text-sm text-[#8B7A6B]">
                      {req.customer_phone} · {formatDate(req.created_at)}
                    </p>
                    <p className="text-sm text-[#8B7A6B]">
                      {req.furniture_type === "Outro" && req.furniture_other
                        ? req.furniture_other
                        : req.furniture_type}{" "}
                      — {req.environment}
                    </p>
                    {req.additional_description && (
                      <p className="text-xs text-[#8B7A6B] line-clamp-2">{req.additional_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {req.status === "pendente" && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/budget-requests/${req.id}/convert`)}
                      >
                        Converter
                      </Button>
                    )}
                    {req.status === "convertido" && req.converted_budget_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/budgets/${req.converted_budget_id}/edit`)}
                      >
                        Ver Orçamento
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}