"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  furnitureTemplateSchema,
  type FurnitureTemplateFormData,
} from "@/lib/validations/furniture";
import {
  getFurnitureTemplate,
  updateFurnitureTemplate,
} from "@/modules/furniture-templates/services/furniture.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";

export default function FurnitureTemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FurnitureTemplateFormData>({
    resolver: zodResolver(furnitureTemplateSchema),
  });

  useEffect(() => {
    getFurnitureTemplate(params.id as string)
      .then((template) => {
        reset({
          name: template.name,
          category: template.category ?? "",
          description: template.description ?? "",
          default_material: template.default_material ?? "",
          default_unit: template.default_unit,
          default_price: template.default_price,
          default_width_cm: template.default_width_cm ?? undefined,
          default_depth_cm: template.default_depth_cm ?? undefined,
          default_height_cm: template.default_height_cm ?? undefined,
          default_finish: template.default_finish ?? "",
          active: template.active,
        });
      })
      .catch(() => showToast("Erro ao carregar modelo", "error"))
      .finally(() => setFetching(false));
  }, [params.id, reset]);

  async function onSubmit(data: FurnitureTemplateFormData) {
    try {
      setLoading(true);
      await updateFurnitureTemplate(params.id as string, {
        name: data.name,
        category: data.category || null,
        description: data.description || null,
        default_material: data.default_material || null,
        default_unit: data.default_unit,
        default_price: data.default_price,
        default_width_cm: data.default_width_cm || null,
        default_depth_cm: data.default_depth_cm || null,
        default_height_cm: data.default_height_cm || null,
        default_finish: data.default_finish || null,
      });
      showToast("Modelo atualizado com sucesso", "success");
      router.push("/furniture-templates");
    } catch {
      showToast("Erro ao salvar modelo", "error");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <p className="py-8 text-center text-[#8B7A6B]">Carregando...</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Editar Modelo de Móvel</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Nome do móvel *"
              {...register("name")}
              error={errors.name?.message}
            />
            <Select
              id="category"
              label="Categoria"
              {...register("category")}
              options={[
                { value: "Cozinha", label: "Cozinha" },
                { value: "Banheiro", label: "Banheiro" },
                { value: "Quarto", label: "Quarto" },
                { value: "Sala", label: "Sala" },
                { value: "Escritorio", label: "Escritório" },
                { value: "Outro", label: "Outro" },
              ]}
            />
            <Textarea
              id="description"
              label="Descrição"
              {...register("description")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores e Dimensões Padrão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="default_material"
                label="Material padrão"
                {...register("default_material")}
              />
              <Select
                id="default_unit"
                label="Unidade *"
                {...register("default_unit")}
                error={errors.default_unit?.message}
                options={[
                  { value: "un", label: "Unidade" },
                  { value: "m²", label: "Metro quadrado" },
                  { value: "m", label: "Metro" },
                  { value: "h", label: "Hora" },
                ]}
              />
              <Input
                id="default_price"
                label="Valor unitário padrão"
                type="number"
                step="0.01"
                {...register("default_price")}
                error={errors.default_price?.message}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="default_width_cm"
                label="Largura padrão (cm)"
                type="number"
                step="0.01"
                {...register("default_width_cm")}
              />
              <Input
                id="default_depth_cm"
                label="Profundidade padrão (cm)"
                type="number"
                step="0.01"
                {...register("default_depth_cm")}
              />
              <Input
                id="default_height_cm"
                label="Altura padrão (cm)"
                type="number"
                step="0.01"
                {...register("default_height_cm")}
              />
            </div>
            <Input
              id="default_finish"
              label="Acabamento padrão"
              {...register("default_finish")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/furniture-templates")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
