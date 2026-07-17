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
import type { Customer } from "@/types";

export default function BudgetNewPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      validity_days: 30,
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

  async function onSubmit(data: BudgetFormData) {
    try {
      setLoading(true);
      await createBudget(
        {
          customer_id: data.customer_id,
          status: "rascunho",
          validity_days: data.validity_days,
          notes_internal: data.notes_internal || null,
          notes_client: data.notes_client || null,
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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Novo Orçamento</h1>

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

                <div className="grid grid-cols-2 gap-4">
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
                  <Input
                    id={`items.${index}.description`}
                    label="Descrição *"
                    {...register(`items.${index}.description`)}
                    error={errors.items?.[index]?.description?.message}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
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

                <div className="grid grid-cols-4 gap-4">
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

        <div className="flex items-center justify-between rounded-md bg-[#5B3A29] px-6 py-4 text-white">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex justify-end gap-3">
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
