"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  furnitureTemplateSchema,
  type FurnitureTemplateFormData,
} from "@/lib/validations/furniture";
import { createFurnitureTemplate } from "@/modules/furniture-templates/services/furniture.actions";
import { saveTemplateParts } from "@/modules/pricing/services/pricing.engine";
import { listMaterials } from "@/modules/inventory/services/inventory.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/ui/toast";
import type { Material } from "@/types";

export default function FurnitureTemplateNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FurnitureTemplateFormData>({
    resolver: zodResolver(furnitureTemplateSchema),
    defaultValues: {
      default_unit: "un",
      default_price: 0,
      active: true,
      parts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parts",
  });

  useEffect(() => {
    listMaterials().then((m) => m && setMaterials(m as Material[]));
  }, []);

  const sheetMaterials = materials.filter((m) => m.is_sheet);
  const edgebandMaterials = materials.filter((m) => m.is_edgeband);
  const hardwareMaterials = materials.filter(
    (m) => m.category === "ferragem" || m.category === "fixacao"
  );

  async function onSubmit(data: FurnitureTemplateFormData) {
    try {
      setLoading(true);
      const template = await createFurnitureTemplate({
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
        active: true,
      });

      if (data.parts && data.parts.length > 0) {
        await saveTemplateParts(
          template.id,
          data.parts.map((p) => ({
            part_type: p.part_type,
            material_id: p.material_id || null,
            name: p.name,
            width_mm: p.width_mm || null,
            height_mm: p.height_mm || null,
            depth_mm: p.depth_mm || null,
            quantity: p.quantity || 1,
            has_edgeband: p.has_edgeband || false,
            edgeband_sides: p.edgeband_sides || ["all"],
            sort_order: p.sort_order || 0,
          }))
        );
      }

      showToast("Modelo criado com sucesso", "success");
      router.push("/furniture-templates");
    } catch {
      showToast("Erro ao criar modelo", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#3D2519]">Novo Modelo de Móvel</h1>

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
              placeholder="Ex: Balcão de pia de cozinha"
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
              placeholder="Descrição detalhada do móvel..."
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
                placeholder="Ex: MDF"
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
              placeholder="Ex: Brilho, Fosco, Madeira"
            />
          </CardContent>
        </Card>

        {/* Recipe / Composição */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Composição do Móvel (Receita)</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({
                  part_type: "mdf",
                  material_id: null,
                  name: "",
                  width_mm: null,
                  height_mm: null,
                  depth_mm: null,
                  quantity: 1,
                  has_edgeband: false,
                  edgeband_sides: ["all"],
                  sort_order: fields.length,
                })
              }
            >
              + Peça MDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.length === 0 && (
              <p className="text-sm text-[#8B7A6B]">
                Nenhuma peça cadastrada. Adicione as peças MDF, ferragens e fitas que compõem este móvel.
              </p>
            )}

            {fields.map((field, index) => {
              const partType = watch(`parts.${index}.part_type`);
              const hasEdgeview = watch(`parts.${index}.has_edgeband`);

              return (
                <div
                  key={field.id}
                  className="rounded border border=[#D4C4B0] bg-white p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3D2519]">Peça {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      {...register(`parts.${index}.part_type`)}
                      label="Tipo"
                      options={[
                        { value: "mdf", label: "MDF / Chapa" },
                        { value: "fita_borda", label: "Fita de Borda" },
                        { value: "ferragem", label: "Ferragem" },
                        { value: "mao_obra", label: "Mão de Obra" },
                      ]}
                    />
                    <Input
                      label="Nome"
                      {...register(`parts.${index}.name`)}
                      placeholder="Ex: Lateral esquerda"
                    />
                  </div>

                  {partType === "mdf" && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="Largura (mm)"
                          type="number"
                          {...register(`parts.${index}.width_mm`)}
                        />
                        <Input
                          label="Altura (mm)"
                          type="number"
                          {...register(`parts.${index}.height_mm`)}
                        />
                        <Input
                          label="Qtd"
                          type="number"
                          step="1"
                          {...register(`parts.${index}.quantity`)}
                        />
                      </div>
                      <Select
                        label="Material"
                        {...register(`parts.${index}.material_id`)}
                        options={[
                          { value: "", label: "Selecione o MDF..." },
                          ...sheetMaterials.map((m) => ({
                            value: m.id,
                            label: `${m.name} (${m.sheet_width_mm}x${m.sheet_height_mm}mm)`,
                          })),
                        ]}
                      />
                      <label className="flex items-center gap-2 text-sm text-[#3D2519]">
                        <input
                          type="checkbox"
                          {...register(`parts.${index}.has_edgeband`)}
                          className="accent-[#5B3A29]"
                        />
                        Leva fita de borda
                      </label>
                      {hasEdgeview && (
                        <div className="flex flex-wrap gap-2">
                          {["all", "top", "bottom", "left", "right"].map((side) => (
                            <label
                              key={side}
                              className="flex items-center gap-1 text-xs text-[#8B7A6B]"
                            >
                              <input
                                type="checkbox"
                                value={side}
                                {...register(`parts.${index}.edgeband_sides`)}
                                className="accent-[#5B3A29]"
                              />
                              {side === "all"
                                ? "Todos"
                                : side === "top"
                                  ? "Topo"
                                  : side === "bottom"
                                    ? "Base"
                                    : side === "left"
                                      ? "Esq."
                                      : "Dir."}
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {(partType === "ferragem" || partType === "mao_obra") && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Quantidade"
                        type="number"
                        step="1"
                        {...register(`parts.${index}.quantity`)}
                      />
                      <Select
                        label="Material"
                        {...register(`parts.${index}.material_id`)}
                        options={[
                          { value: "", label: "Selecione..." },
                          ...hardwareMaterials.map((m) => ({
                            value: m.id,
                            label: `${- name} (R$ ${m.cost.toFixed(2)})`,
                          })),
                        ]}
                      />
                    </div>
                  )}

                  {partType === "fita_borda" && (
                    <Select
                      label="Material da fita"
                      {...register(`parts.${index}.material_id`)}
                      options={[
                        { value: "", label: "Selecione a fita..." },
                        ...edgebandMaterials.map((m) => ({
                          value: m.id,
                          label: `${m.name} (R$ ${(m.price_per_unit || m.cost).toFixed(2)}/m)`,
                        })),
                      ]}
                    />
                  )}
                </div>
              );
            })}

            {fields.length > 0 && (
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      part_type: "mdf",
                      material_id: null,
                      name: "",
                      width_mm: null,
                      height_mm: null,
                      depth_mm: null,
                      quantity: 1,
                      has_edgeband: false,
                      edgeband_sides: ["all"],
                      sort_order: fields.length,
                    })
                  }
                >
                  + Peça MDF
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      part_type: "ferragem",
                      material_id: null,
                      name: "",
                      quantity: 1,
                      has_edgeband: false,
                      edgeband_sides: [],
                      sort_order: fields.length,
                    })
                  }
                >
                  + Ferragem
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      part_type: "fita_borda",
                      material_id: null,
                      name: "",
                      quantity: 1,
                      has_edgeband: false,
                      edgeband_sides: [],
                      sort_order: fields.length,
                    })
                  }
                >
                  + Fita
                </Button>
              </div>
            )}
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
            {loading ? "Salvando..." : "Criar Modelo"}
          </Button>
        </div>
      </form>
    </div>
  );
}