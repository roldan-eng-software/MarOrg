"use client";

import { useState, useEffect } from "react";
import {
  listCosts,
  createCost,
  updateCost,
  deleteCost,
} from "@/modules/costs/services/costs.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import type { Cost } from "@/types";

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cost | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"fixo" | "variavel">("variavel");
  const [formValue, setFormValue] = useState(0);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCosts();
  }, []);

  async function loadCosts() {
    try {
      setLoading(true);
      const data = await listCosts(false);
      setCosts(data);
    } catch {
      showToast("Erro ao carregar custos", "error");
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditingCost(null);
    setFormName("");
    setFormDescription("");
    setFormType("variavel");
    setFormValue(0);
    setShowForm(true);
  }

  function openEdit(cost: Cost) {
    setEditingCost(cost);
    setFormName(cost.name);
    setFormDescription(cost.description ?? "");
    setFormType(cost.cost_type);
    setFormValue(Number(cost.default_value));
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName.trim()) {
      showToast("Informe o nome do custo", "error");
      return;
    }

    try {
      setFormLoading(true);
      if (editingCost) {
        await updateCost(editingCost.id, {
          name: formName.trim(),
          description: formDescription.trim() || null,
          cost_type: formType,
          default_value: formValue,
        });
        showToast("Custo atualizado com sucesso", "success");
      } else {
        await createCost({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          cost_type: formType,
          default_value: formValue,
        });
        showToast("Custo criado com sucesso", "success");
      }
      setShowForm(false);
      loadCosts();
    } catch {
      showToast("Erro ao salvar custo", "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCost(deleteTarget.id);
      showToast("Custo desativado", "success");
      setDeleteTarget(null);
      loadCosts();
    } catch {
      showToast("Erro ao desativar custo", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">Custos</h1>
        <Button onClick={openNew}>Novo Custo</Button>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
          ) : costs.length === 0 ? (
            <p className="py-8 text-center text-[#8B7A6B]">
              Nenhum custo cadastrado
            </p>
          ) : (
            <div className="divide-y divide-[#D4C4B0]">
              {costs.map((cost) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#3D2519]">{cost.name}</p>
                      <Badge variant={cost.cost_type === "fixo" ? "default" : "info"}>
                        {cost.cost_type === "fixo" ? "Fixo" : "Variável"}
                      </Badge>
                      {!cost.active && (
                        <Badge variant="danger">Inativo</Badge>
                      )}
                    </div>
                    {cost.description && (
                      <p className="text-sm text-[#8B7A6B] truncate">
                        {cost.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-[#3D2519]">
                      {formatCurrency(Number(cost.default_value))}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(cost)}
                      >
                        Editar
                      </Button>
                      {cost.active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(cost)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Desativar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogHeader
          title={editingCost ? "Editar Custo" : "Novo Custo"}
          description="Cadastre custos fixos ou variáveis para usar nos orçamentos"
        />
        <div className="space-y-4">
          <Input
            id="cost-name"
            label="Nome *"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ex: Frete de Entrega"
          />
          <Textarea
            id="cost-description"
            label="Descrição (opcional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Descrição detalhada do custo"
          />
          <Select
            id="cost-type"
            label="Tipo *"
            value={formType}
            onChange={(e) => setFormType(e.target.value as "fixo" | "variavel")}
            options={[
              { value: "fixo", label: "Fixo" },
              { value: "variavel", label: "Variável" },
            ]}
          />
          <Input
            id="cost-value"
            label="Valor Padrão (R$) *"
            type="number"
            step="0.01"
            min="0"
            value={formValue}
            onChange={(e) => setFormValue(Number(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={formLoading}>
            {formLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogHeader
          title="Desativar Custo"
          description={`Deseja desativar o custo "${deleteTarget?.name}"? Ele não aparecerá mais nos seletores de orçamento.`}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Desativar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}