"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  budgetSchema,
  type BudgetFormData,
} from "@/lib/validations/budget";
import {
  getBudget,
  updateBudget,
  updateBudgetStatus,
} from "@/modules/budgets/services/budgets.actions";
import { listCustomersServer } from "@/modules/customers/services/customers.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils/format";
import { FurnitureSelect } from "@/components/furniture-select";
import type { Customer, BudgetItem, FurnitureTemplate } from "@/types";

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  vencido: "Vencido",
  revisado: "Revisado",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  rascunho: "default",
  enviado: "info",
  em_analise: "warning",
  aprovado: "success",
  recusado: "danger",
  vencido: "danger",
  revisado: "info",
};

export default function BudgetEditPage() {
  const router = useRouter();
  const params = useParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [budgetStatus, setBudgetStatus] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  useEffect(() => {
    Promise.all([
      getBudget(params.id as string),
      listCustomersServer(),
    ]).then(([budget, customerList]) => {
      setBudgetStatus(budget.status);
      setCustomers(customerList);
      reset({
        customer_id: budget.customer_id,
        validity_days: budget.validity_days,
        delivery_days: budget.delivery_days ?? 30,
        notes_internal: budget.notes_internal ?? "",
        notes_client: budget.notes_client ?? "",
        items: budget.items.map((item: BudgetItem) => ({
          item_type: item.item_type,
          description: item.description,
          material: item.material ?? "",
          width_cm: item.width_cm ?? undefined,
          depth_cm: item.depth_cm ?? undefined,
          height_cm: item.height_cm ?? undefined,
          finish: item.finish ?? "",
          unit: item.unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          notes: item.notes ?? "",
          sort_order: item.sort_order,
        })),
      });
    }).catch(() => {
      showToast("Erro ao carregar orçamento", "error");
    }).finally(() => setFetching(false));
  }, [params.id, reset]);

  const totalAmount = items?.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unit_price || 0;
    const disc = item.discount || 0;
    return sum + qty * price - disc;
  }, 0) ?? 0;

  const canEdit = ["rascunho", "enviado", "em_analise", "revisado"].includes(budgetStatus);

  async function onSubmit(data: BudgetFormData) {
    try {
      setLoading(true);
      await updateBudget(
        params.id as string,
        {
          customer_id: data.customer_id,
          validity_days: data.validity_days,
          delivery_days: data.delivery_days,
          notes_internal: data.notes_internal || null,
          notes_client: data.notes_client || null,
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
      showToast("Orçamento atualizado com sucesso", "success");
    } catch {
      showToast("Erro ao salvar orçamento", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      setLoading(true);
      await updateBudgetStatus(params.id as string, newStatus as "rascunho" | "enviado" | "em_analise" | "aprovado" | "recusado" | "vencido" | "revisado");
      setBudgetStatus(newStatus);
      showToast(`Status alterado para ${statusLabels[newStatus]}`, "success");
    } catch {
      showToast("Erro ao alterar status", "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D2519]">
          Editar Orçamento
        </h1>
        <Badge variant={statusVariants[budgetStatus]}>
          {statusLabels[budgetStatus]}
        </Badge>
      </div>

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
              disabled={!canEdit}
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
              disabled={!canEdit}
            />
            <Input
              id="delivery_days"
              label="Prazo de Entrega (dias)"
              type="number"
              {...register("delivery_days")}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Itens</CardTitle>
            {canEdit && (
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
            )}
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
                  {canEdit && fields.length > 1 && (
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
                    disabled={!canEdit}
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
                      disabled={!canEdit}
                    />
                  ) : (
                    <Input
                      id={`items.${index}.description`}
                      label="Descrição *"
                      {...register(`items.${index}.description`)}
                      disabled={!canEdit}
                      error={errors.items?.[index]?.description?.message}
                    />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Input
                    id={`items.${index}.material`}
                    label="Material"
                    {...register(`items.${index}.material`)}
                    disabled={!canEdit}
                  />
                  <Input
                    id={`items.${index}.unit`}
                    label="Unidade *"
                    {...register(`items.${index}.unit`)}
                    disabled={!canEdit}
                  />
                  <Input
                    id={`items.${index}.quantity`}
                    label="Qtd *"
                    type="number"
                    step="0.001"
                    {...register(`items.${index}.quantity`)}
                    disabled={!canEdit}
                    error={errors.items?.[index]?.quantity?.message}
                  />
                  <Input
                    id={`items.${index}.unit_price`}
                    label="Preço Unit. *"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unit_price`)}
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                  />
                  <Input
                    id={`items.${index}.depth_cm`}
                    label="Profundidade (cm)"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.depth_cm`)}
                    disabled={!canEdit}
                  />
                  <Input
                    id={`items.${index}.height_cm`}
                    label="Altura (cm)"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.height_cm`)}
                    disabled={!canEdit}
                  />
                  <Input
                    id={`items.${index}.discount`}
                    label="Desconto"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.discount`)}
                    disabled={!canEdit}
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
              disabled={!canEdit}
            />
            <Textarea
              id="notes_client"
              label="Observações para o cliente"
              {...register("notes_client")}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-md bg-[#5B3A29] px-6 py-4 text-white">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
        </div>

        {canEdit && (
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/budgets")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </form>

      <div className="flex flex-wrap gap-3 border-t border-[#D4C4B0] pt-6">
        {budgetStatus === "rascunho" && (
          <Button onClick={() => handleStatusChange("enviado")} disabled={loading}>
            Enviar ao Cliente
          </Button>
        )}
        {budgetStatus === "enviado" && (
          <Button onClick={() => handleStatusChange("em_analise")} disabled={loading}>
            Marcar em Análise
          </Button>
        )}
        {["enviado", "em_analise", "revisado"].includes(budgetStatus) && (
          <>
            <Button
              variant="primary"
              onClick={() => handleStatusChange("aprovado")}
              disabled={loading}
            >
              Aprovar
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusChange("recusado")}
              disabled={loading}
            >
              Recusar
            </Button>
          </>
        )}
        {budgetStatus === "aprovado" && (
          <Button
            onClick={() => router.push(`/budgets/${params.id}/send`)}
          >
            Enviar PDF
          </Button>
        )}
      </div>
    </div>
  );
}
