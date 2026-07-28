"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  budgetSchema,
  type BudgetFormData,
} from "@/lib/validations/budget";
import { createBudget } from "@/modules/budgets/services/budgets.actions";
import { listCustomersServer } from "@/modules/customers/services/customers.actions";
import { listCosts } from "@/modules/costs/services/costs.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import { FurnitureSelect } from "@/components/furniture-select";
import { MaterialPicker } from "@/components/material-picker";
import type { Customer, FurnitureTemplate, Material, Cost } from "@/types";

interface ItemMaterial {
  materialId: string;
  name: string;
  unitCost: number;
  quantity: number;
}

interface BudgetCostForm {
  costId: string | null;
  name: string;
  costType: string | null;
  value: number;
  quantity: number;
}

export default function BudgetNewPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemMaterials, setItemMaterials] = useState<Record<number, ItemMaterial[]>>({});
  const [manualRawCost, setManualRawCost] = useState<number | null>(null);
  const [budgetCosts, setBudgetCosts] = useState<BudgetCostForm[]>([]);
  const [availableCosts, setAvailableCosts] = useState<Cost[]>([]);
  const [profitMargin, setProfitMargin] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      validity_days: 30,
      delivery_days: 30,
      payment_conditions: "",
      payment_installments: [],
      payment_types: [],
      deposit_percentage: 0,
      installment_count: 1,
      raw_material_cost: 0,
      overhead_cost: 0,
      profit_margin: 0,
      items: [
        {
          item_type: "mobiliario",
          description: "",
          material: "",
          unit: "un",
          quantity: 1,
          unit_price: 0,
          discount: 0,
          sort_order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const depositPercentage = watch("deposit_percentage");
  const installmentCount = watch("installment_count");
  const productionDays = watch("production_days") || 0;

  useEffect(() => {
    listCustomersServer()
      .then(setCustomers)
      .catch(() => setCustomers([]));
    listCosts(true)
      .then(setAvailableCosts)
      .catch(() => setAvailableCosts([]));
  }, []);

  const totalAmount = items.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unit_price || 0;
    const disc = item.discount || 0;
    return sum + qty * price - disc;
  }, 0);

  const depositValue = totalAmount * ((depositPercentage ?? 0) / 100);
  const remaining = totalAmount - depositValue;
  const count = installmentCount ?? 1;
  const installmentValue = count > 0 ? remaining / count : remaining;

  useEffect(() => {
    const pct = depositPercentage ?? 0;
    const instCount = installmentCount ?? 1;
    const newInstallments: BudgetFormData["payment_installments"] = [];

    if (pct > 0) {
      newInstallments.push({
        installment: 1,
        description: "Sinal de Entrada",
        due_date: "",
        percentage: pct,
      });
    }

    const restPct = 100 - pct;
    const perInstallmentPct = instCount > 0 ? restPct / instCount : restPct;

    for (let i = 0; i < instCount; i++) {
      newInstallments.push({
        installment: newInstallments.length + 1,
        description: instCount === 1 ? "Pagamento Único" : `Parcela ${i + 1}/${instCount}`,
        due_date: "",
        percentage: Math.round(perInstallmentPct * 100) / 100,
      });
    }

    setValue("payment_installments", newInstallments);
  }, [depositPercentage, installmentCount, setValue]);

  useEffect(() => {
    setBudgetCosts((prev) =>
      prev.map((c) =>
        c.costType === "fixo" ? { ...c, quantity: productionDays } : c
      )
    );
  }, [productionDays]);

  function getItemMaterialsCost(itemIndex: number) {
    const mats = itemMaterials[itemIndex] || [];
    return mats.reduce((sum, m) => sum + m.unitCost * m.quantity, 0);
  }

  const computedRawCost = (items ?? []).reduce((sum, _item, i) => sum + getItemMaterialsCost(i), 0);

  const overheadCost = budgetCosts.reduce((sum, c) => sum + c.value * c.quantity, 0);
  const rawMaterialCost = manualRawCost !== null ? manualRawCost : computedRawCost;
  const totalCost = rawMaterialCost + overheadCost;
  const suggestedTotal = totalCost * (1 + profitMargin / 100);
  const estimatedProfit = suggestedTotal - totalCost;

  function addMaterialToItem(itemIndex: number, material: Material) {
    setItemMaterials((prev) => {
      const current = [...(prev[itemIndex] || [])];
      current.push({
        materialId: material.id,
        name: material.name,
        unitCost: Number(material.cost),
        quantity: 1,
      });
      return { ...prev, [itemIndex]: current };
    });
  }

  function removeMaterialFromItem(itemIndex: number, matIndex: number) {
    setItemMaterials((prev) => {
      const current = [...(prev[itemIndex] || [])];
      current.splice(matIndex, 1);
      return { ...prev, [itemIndex]: current };
    });
  }

  function updateMaterialQty(itemIndex: number, matIndex: number, qty: number) {
    setItemMaterials((prev) => {
      const current = [...(prev[itemIndex] || [])];
      current[matIndex] = { ...current[matIndex], quantity: qty };
      return { ...prev, [itemIndex]: current };
    });
  }

  function updateMaterialCost(itemIndex: number, matIndex: number, cost: number) {
    setItemMaterials((prev) => {
      const current = [...(prev[itemIndex] || [])];
      current[matIndex] = { ...current[matIndex], unitCost: cost };
      return { ...prev, [itemIndex]: current };
    });
  }

  function applySuggestedPrice() {
    if (totalCost <= 0 || profitMargin <= 0) {
      showToast("Defina os custos e a margem antes de aplicar", "error");
      return;
    }

    const itemsWithCost: { index: number; costTotal: number }[] = [];
    for (let i = 0; i < (items ?? []).length; i++) {
      const costTotal = getItemMaterialsCost(i);
      if (costTotal > 0) {
        itemsWithCost.push({ index: i, costTotal });
      }
    }

    if (itemsWithCost.length === 0) {
      showToast("Adicione materiais aos itens para aplicar o preço sugerido", "error");
      return;
    }

    const totalRawCost = itemsWithCost.reduce((s, ic) => s + ic.costTotal, 0);

    for (const { index, costTotal } of itemsWithCost) {
      const share = totalRawCost > 0 ? costTotal / totalRawCost : 1 / itemsWithCost.length;
      const contribution = suggestedTotal * share;
      const unitPrice = contribution / ((items?.[index]?.quantity ?? 0) || 1);
      setValue(`items.${index}.unit_price`, Math.round(unitPrice * 100) / 100);
    }

    showToast("Preço sugerido aplicado aos itens", "success");
  }

  function buildMaterialsPayload() {
    const payload: Record<number, { material_id: string; quantity: number; unit_cost: number }[]> = {};
    for (const itemIndexStr of Object.keys(itemMaterials)) {
      const itemIndex = Number(itemIndexStr);
      const mats = itemMaterials[itemIndex];
      if (mats && mats.length > 0) {
        payload[itemIndex] = mats.map((m) => ({
          material_id: m.materialId,
          quantity: m.quantity,
          unit_cost: m.unitCost,
        }));
      }
    }
    return payload;
  }

  function addCostFromTemplate(cost: Cost) {
    const isFixed = cost.cost_type === "fixo";
    setBudgetCosts((prev) => [
      ...prev,
      {
        costId: cost.id,
        name: cost.name,
        costType: cost.cost_type,
        value: isFixed ? Number(cost.default_value) / 30 : Number(cost.default_value),
        quantity: isFixed ? productionDays : 1,
      },
    ]);
  }

  function addFreeCost() {
    setBudgetCosts((prev) => [
      ...prev,
      {
        costId: null,
        name: "Outro custo",
        costType: "variavel",
        value: 0,
        quantity: 1,
      },
    ]);
  }

  function removeBudgetCost(index: number) {
    setBudgetCosts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBudgetCost(index: number, field: keyof BudgetCostForm, value: string | number) {
    setBudgetCosts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  async function onSubmit(data: BudgetFormData) {
    try {
      setLoading(true);
      await createBudget(
        {
          customer_id: data.customer_id,
          status: "rascunho",
          validity_days: data.validity_days,
          delivery_days: data.delivery_days,
          production_days: Number(data.production_days ?? 0),
          notes_internal: data.notes_internal || null,
          notes_client: data.notes_client || null,
          payment_conditions: data.payment_conditions || null,
          payment_installments: data.payment_installments || [],
          payment_types: data.payment_types || [],
          deposit_percentage: data.deposit_percentage ?? 0,
          installment_count: data.installment_count ?? 1,
          raw_material_cost: rawMaterialCost,
          overhead_cost: overheadCost,
          profit_margin: profitMargin,
          created_by: "",
        },
        data.items.map((item, i) => ({
          item_type: item.item_type,
          description: item.description,
          material: item.material || null,
          material_id: null,
          width_cm: item.width_cm || null,
          depth_cm: item.depth_cm || null,
          height_cm: item.height_cm || null,
          finish: item.finish || null,
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount || 0,
          total_price: item.quantity * item.unit_price - (item.discount || 0),
          notes: item.notes || null,
          sort_order: i,
        })),
        buildMaterialsPayload(),
        budgetCosts.map((c) => ({
          cost_id: c.costId,
          name: c.name,
          cost_type: c.costType,
          value: c.value,
          quantity: c.quantity,
        }))
      );
      showToast("Orçamento criado com sucesso", "success");
      router.push("/budgets");
    } catch {
      showToast("Erro ao criar orçamento", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-0 sm:px-0 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-[#3D2519]">Novo Orçamento</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              id="customer_id"
              label="Cliente *"
              placeholder="Selecione um cliente"
              {...register("customer_id")}
              error={errors.customer_id?.message}
              options={customers.map((c) => ({
                value: c.id,
                label: c.full_name,
              }))}
            />
            <Input
              id="validity_days"
              label="Validade (dias)"
              type="number"
              {...register("validity_days")}
            />
            <Input
              id="delivery_days"
              label="Prazo de Entrega (dias)"
              type="number"
              {...register("delivery_days")}
            />
            <Input
              id="production_days"
              label="Dias de Produção"
              type="number"
              min="0"
              {...register("production_days")}
              placeholder="Usado para calcular custos fixos"
            />
            <p className="text-xs text-[#8B7A6B]">
              Os custos fixos são calculados automaticamente: (valor mensal ÷ 30) × dias de produção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Itens</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                append({
                  item_type: "mobiliario",
                  description: "",
                  material: "",
                  unit: "un",
                  quantity: 1,
                  unit_price: 0,
                  discount: 0,
                  sort_order: fields.length,
                });
              }}
            >
              + Adicionar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-md border border-[#D4C4B0] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#3D2519]">
                    Item {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        remove(index);
                        const newMaterials = { ...itemMaterials };
                        delete newMaterials[index];
                        setItemMaterials(newMaterials);
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    id={`items.${index}.item_type`}
                    label="Tipo *"
                    {...register(`items.${index}.item_type`)}
                    error={errors.items?.[index]?.item_type?.message}
                    options={[
                      { value: "mobiliario", label: "Mobiliário" },
                      { value: "servico", label: "Serviço" },
                    ]}
                  />
                  {watch(`items.${index}.item_type`) === "mobiliario" ? (
                    <FurnitureSelect
                      value={watch(`items.${index}.description`)}
                      onChange={(val) => {
                        setValue(`items.${index}.description`, val);
                      }}
                      onSelectTemplate={(template: FurnitureTemplate) => {
                        setValue(`items.${index}.description`, template.name);
                        if (template.default_material) setValue(`items.${index}.material`, template.default_material);
                        if (template.default_unit) setValue(`items.${index}.unit`, template.default_unit);
                        if (template.default_price) setValue(`items.${index}.unit_price`, template.default_price);
                        if (template.default_width_cm) setValue(`items.${index}.width_cm`, template.default_width_cm);
                        if (template.default_depth_cm) setValue(`items.${index}.depth_cm`, template.default_depth_cm);
                        if (template.default_height_cm) setValue(`items.${index}.height_cm`, template.default_height_cm);
                        if (template.default_finish) setValue(`items.${index}.finish`, template.default_finish);
                      }}
                      error={errors.items?.[index]?.description?.message}
                    />
                  ) : (
                    <Input
                      id={`items.${index}.description`}
                      label="Descrição *"
                      {...register(`items.${index}.description`)}
                      error={errors.items?.[index]?.description?.message}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    id={`items.${index}.unit`}
                    label="Unidade *"
                    {...register(`items.${index}.unit`)}
                  />
                  <Input
                    id={`items.${index}.quantity`}
                    label="Qtd *"
                    type="number"
                    step="0.001"
                    {...register(`items.${index}.quantity`)}
                    error={errors.items?.[index]?.quantity?.message}
                  />
                  <Input
                    id={`items.${index}.unit_price`}
                    label="Preço Unit. *"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_price`)}
                    error={errors.items?.[index]?.unit_price?.message}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    id={`items.${index}.width_cm`}
                    label="Largura (cm)"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.width_cm`)}
                  />
                  <Input
                    id={`items.${index}.depth_cm`}
                    label="Profundidade (cm)"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.depth_cm`)}
                  />
                  <Input
                    id={`items.${index}.height_cm`}
                    label="Altura (cm)"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.height_cm`)}
                  />
                  <Input
                    id={`items.${index}.discount`}
                    label="Desconto"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.discount`)}
                  />
                </div>

                {/* Materiais do Item */}
                <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase text-[#8B7A6B]">
                    Materiais do Item
                  </p>

                  {(itemMaterials[index] || []).length === 0 ? (
                    <p className="text-xs text-[#8B7A6B]">
                      Nenhum material adicionado. Selecione abaixo os materiais usados neste item.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(itemMaterials[index] || []).map((mat, mi) => (
                        <div
                          key={mi}
                          className="flex items-center gap-2 rounded bg-white border border-[#D4C4B0] px-3 py-2"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3D2519] truncate">
                              {mat.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={mat.quantity}
                              onChange={(e) => updateMaterialQty(index, mi, Number(e.target.value))}
                              className="w-16 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-center"
                            />
                            <span className="text-xs text-[#8B7A6B]">x</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={mat.unitCost}
                              onChange={(e) => updateMaterialCost(index, mi, Number(e.target.value))}
                              className="w-20 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-right"
                            />
                            <span className="text-xs font-semibold text-[#3D2519] w-16 text-right">
                              {formatCurrency(mat.unitCost * mat.quantity)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMaterialFromItem(index, mi)}
                            className="text-red-400 hover:text-red-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <MaterialPicker
                    value=""
                    materialId={null}
                    onChange={() => {}}
                    onMaterialSelect={(mat) => addMaterialToItem(index, mat)}
                    onClear={() => {}}
                  />

                  {(itemMaterials[index] || []).length > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-[#3D2519] pt-1 border-t border-[#D4C4B0]">
                      <span>Total Materiais</span>
                      <span>{formatCurrency(getItemMaterialsCost(index))}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Custos do Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle>Custos do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#8B7A6B]">
              Selecione os custos fixos/variáveis que se aplicam a este orçamento.
            </p>

            {budgetCosts.length > 0 && (
              <div className="space-y-2">
                {budgetCosts.map((cost, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded bg-[#F5F0EB] border border-[#D4C4B0] px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={cost.name}
                        onChange={(e) => updateBudgetCost(i, "name", e.target.value)}
                        className="w-full bg-transparent text-sm font-medium text-[#3D2519] border-none outline-none"
                        placeholder="Nome do custo"
                      />
                    </div>
                    <Badge variant={cost.costType === "fixo" ? "default" : "info"} className="text-[10px]">
                      {cost.costType === "fixo" ? "Fixo" : "Variável"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {cost.costType === "fixo" ? (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cost.value}
                            onChange={(e) => updateBudgetCost(i, "value", Number(e.target.value))}
                            className="w-20 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-right"
                          />
                          <span className="text-[10px] text-[#8B7A6B]">/dia</span>
                          <span className="text-xs text-[#8B7A6B]">x</span>
                          <input
                            type="number"
                            min="0"
                            value={cost.quantity}
                            onChange={(e) => updateBudgetCost(i, "quantity", Number(e.target.value))}
                            className="w-14 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-center"
                          />
                          <span className="text-[10px] text-[#8B7A6B]">d</span>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cost.value}
                            onChange={(e) => updateBudgetCost(i, "value", Number(e.target.value))}
                            className="w-20 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-right"
                          />
                          <span className="text-xs text-[#8B7A6B]">x</span>
                          <input
                            type="number"
                            min="0"
                            value={cost.quantity}
                            onChange={(e) => updateBudgetCost(i, "quantity", Number(e.target.value))}
                            className="w-14 rounded border border-[#D4C4B0] px-1.5 py-1 text-xs text-center"
                          />
                        </>
                      )}
                      <span className="text-xs font-semibold text-[#3D2519] w-16 text-right">
                        {formatCurrency(cost.value * cost.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBudgetCost(i)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {availableCosts
                .filter((ac) => !budgetCosts.some((bc) => bc.costId === ac.id))
                .map((cost) => (
                  <Button
                    key={cost.id}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => addCostFromTemplate(cost)}
                  >
                    + {cost.name}
                  </Button>
                ))
              }
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addFreeCost}
              >
                + Outro custo
              </Button>
            </div>

            {budgetCosts.length > 0 && (
              <div className="flex justify-between text-sm font-semibold text-[#3D2519] pt-2 border-t border-[#D4C4B0]">
                <span>Total Custos</span>
                <span>{formatCurrency(overheadCost)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Margem e Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Margem e Custos (interno)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-[#8B7A6B]">Custo Matéria-Prima</p>
                <p className="text-lg font-semibold text-[#3D2519]">
                  {formatCurrency(rawMaterialCost)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (manualRawCost !== null) {
                    setManualRawCost(null);
                  } else {
                    setManualRawCost(computedRawCost);
                  }
                }}
              >
                {manualRawCost !== null ? "Auto" : "Editar"}
              </Button>
            </div>

            {manualRawCost !== null && (
              <Input
                id="manual_raw_cost"
                label="Custo Matéria-Prima (manual)"
                type="number"
                step="0.01"
                value={manualRawCost}
                onChange={(e) => setManualRawCost(Number(e.target.value))}
              />
            )}

            <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7A6B]">Custos Fixos / Variáveis</span>
                <span className="font-semibold text-[#3D2519]">{formatCurrency(overheadCost)}</span>
              </div>
            </div>

            <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7A6B]">Custo Total</span>
                <span className="font-semibold text-[#3D2519]">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <Input
              id="profit_margin"
              label="Margem de Lucro (%)"
              type="number"
              step="0.1"
              value={profitMargin}
              onChange={(e) => setProfitMargin(Number(e.target.value))}
            />

            <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7A6B]">Preço Sugerido</span>
                <span className="font-semibold text-[#3D2519]">{formatCurrency(suggestedTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B7A6B]">Lucro Estimado</span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(estimatedProfit)} ({profitMargin}%)
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={applySuggestedPrice}
            >
              Aplicar Preço Sugerido
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condições de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#3D2519] mb-2 block">
                Formas de Pagamento
              </label>
              <div className="flex flex-wrap gap-2">
                {["PIX", "Boleto", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Transferência", "Cheque"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 rounded border border-[#D4C4B0] px-3 py-1.5 text-sm text-[#3D2519] cursor-pointer hover:bg-[#F5F0EB] has-[:checked]:bg-[#5B3A29] has-[:checked]:text-white has-[:checked]:border-[#5B3A29]"
                  >
                    <input
                      type="checkbox"
                      value={type}
                      {...register("payment_types")}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="deposit_percentage"
                label="% Sinal de Entrada"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("deposit_percentage")}
                placeholder="Ex: 30"
              />
              <Input
                id="installment_count"
                label="Parcelas"
                type="number"
                min="1"
                max="48"
                {...register("installment_count")}
                placeholder="Ex: 3"
              />
            </div>

            {totalAmount > 0 && (
              <div className="rounded-md bg-[#F5F0EB] border border-[#D4C4B0] p-4">
                <p className="text-sm font-medium text-[#3D2519] mb-2">Resumo do Pagamento</p>
                <div className="space-y-1 text-sm text-[#8B7A6B]">
                  {(depositPercentage ?? 0) > 0 && (
                    <p>
                      Sinal ({depositPercentage}%): <span className="font-semibold text-[#3D2519]">{formatCurrency(depositValue)}</span>
                    </p>
                  )}
                  {count > 1 ? (
                    <p>
                      Restante: <span className="font-semibold text-[#3D2519]">{count}x de {formatCurrency(installmentValue)}</span>
                    </p>
                  ) : (depositPercentage ?? 0) > 0 ? (
                    <p>
                      Restante: <span className="font-semibold text-[#3D2519]">{formatCurrency(remaining)}</span> (pagamento único)
                    </p>
                  ) : (
                    <p>
                      Pagamento à vista: <span className="font-semibold text-[#3D2519]">{formatCurrency(totalAmount)}</span>
                    </p>
                  )}
                  <p className="pt-1 border-t border-[#D4C4B0] mt-1">
                    Total: <span className="font-bold text-[#3D2519]">{formatCurrency(totalAmount)}</span>
                  </p>
                </div>
              </div>
            )}

            <Textarea
              id="payment_conditions"
              label="Observações de pagamento"
              {...register("payment_conditions")}
              placeholder="Ex: Entrada na aprovação, restante na entrega..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="notes_internal"
              label="Observações internas"
              {...register("notes_internal")}
            />
            <Textarea
              id="notes_client"
              label="Observações para o cliente"
              {...register("notes_client")}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-md bg-[#5B3A29] px-4 sm:px-6 py-4 text-white">
          <span className="text-base sm:text-lg font-semibold">Total</span>
          <span className="text-lg sm:text-2xl font-bold">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/budgets")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </div>
  );
}