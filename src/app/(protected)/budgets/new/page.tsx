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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import { FurnitureSelect } from "@/components/furniture-select";
import type { Customer, FurnitureTemplate } from "@/types";

export default function BudgetNewPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    listCustomersServer()
      .then(setCustomers)
      .catch(() => setCustomers([]));
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

  async function onSubmit(data: BudgetFormData) {
    try {
      setLoading(true);
      await createBudget(
        {
          customer_id: data.customer_id,
          status: "rascunho",
          validity_days: data.validity_days,
          delivery_days: data.delivery_days,
          notes_internal: data.notes_internal || null,
          notes_client: data.notes_client || null,
          payment_conditions: data.payment_conditions || null,
          payment_installments: data.payment_installments || [],
          payment_types: data.payment_types || [],
          deposit_percentage: data.deposit_percentage ?? 0,
          installment_count: data.installment_count ?? 1,
          created_by: "",
        },
        data.items.map((item, i) => ({
          item_type: item.item_type,
          description: item.description,
          material: item.material || null,
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Itens</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({
                  item_type: "mobiliario",
                  description: "",
                  material: "",
                  unit: "un",
                  quantity: 1,
                  unit_price: 0,
                  discount: 0,
                  sort_order: fields.length,
                })
              }
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
                      onClick={() => remove(index)}
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
                    id={`items.${index}.material`}
                    label="Material"
                    {...register(`items.${index}.material`)}
                  />
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
              </div>
            ))}
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
