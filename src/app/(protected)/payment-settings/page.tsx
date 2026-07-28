"use client";

import { useState, useEffect } from "react";
import {
  getInterestRates,
  updateInterestRate,
} from "@/modules/payments/services/payments.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import type { PaymentInterestRate } from "@/types";

export default function PaymentSettingsPage() {
  const [rates, setRates] = useState<PaymentInterestRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  useEffect(() => {
    loadRates();
  }, []);

  async function loadRates() {
    try {
      setLoading(true);
      const data = await getInterestRates();
      setRates(data);
    } catch {
      showToast("Erro ao carregar taxas", "error");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(rate: PaymentInterestRate) {
    setEditingId(rate.id);
    setEditValue(Number(rate.monthly_rate));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue(0);
  }

  async function saveEdit(id: string) {
    try {
      await updateInterestRate(id, editValue);
      showToast("Taxa atualizada com sucesso", "success");
      setEditingId(null);
      loadRates();
    } catch {
      showToast("Erro ao atualizar taxa", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#3D2519]">Configuração de Pagamento</h1>
        <p className="text-sm text-[#8B7A6B]">
          Defina a taxa de juros mensal para cada tipo de pagamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxas de Juros por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
          ) : rates.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">
              Nenhuma taxa configurada
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 px-3 py-2 text-xs font-semibold uppercase text-[#8B7A6B] border-b border-[#D4C4B0]">
                <span>Tipo de Pagamento</span>
                <span>Taxa Mensal (%)</span>
                <span className="text-right">Ações</span>
              </div>
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="grid grid-cols-3 gap-4 items-center px-3 py-3 rounded hover:bg-[#F5F0EB] transition-colors"
                >
                  <div>
                    <p className="font-medium text-[#3D2519]">{rate.payment_type}</p>
                    {!rate.active && (
                      <p className="text-xs text-red-500">Inativo</p>
                    )}
                  </div>
                  <div>
                    {editingId === rate.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-24 rounded border border-[#D4C4B0] px-2 py-1 text-sm text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(rate.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <span className="text-sm text-[#8B7A6B]">%</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-[#3D2519]">
                        {Number(rate.monthly_rate).toFixed(2)}%
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {editingId === rate.id ? (
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveEdit(rate.id)}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(rate)}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
