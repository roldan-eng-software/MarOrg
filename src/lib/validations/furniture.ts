import { z } from "zod";

export const furnitureTemplateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  default_material: z.string().optional().or(z.literal("")),
  default_unit: z.string().min(1, "Unidade é obrigatória"),
  default_price: z.coerce.number().min(0, "Valor não pode ser negativo"),
  default_width_cm: z.coerce.number().positive("Largura deve ser positiva").optional(),
  default_depth_cm: z.coerce.number().positive("Profundidade deve ser positiva").optional(),
  default_height_cm: z.coerce.number().positive("Altura deve ser positiva").optional(),
  default_finish: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  parts: z
    .array(
      z.object({
        part_type: z.enum(["mdf", "fita_borda", "ferragem", "mao_obra"]),
        material_id: z.string().uuid().nullable().optional(),
        name: z.string().min(1, "Nome da peça é obrigatório"),
        width_mm: z.coerce.number().positive().optional().nullable(),
        height_mm: z.coerce.number().positive().optional().nullable(),
        depth_mm: z.coerce.number().positive().optional().nullable(),
        quantity: z.coerce.number().min(1).default(1),
        has_edgeband: z.boolean().default(false),
        edgeband_sides: z.array(z.string()).default(["all"]),
        sort_order: z.number().default(0),
      })
    )
    .default([]),
});

export type FurnitureTemplateFormData = z.infer<typeof furnitureTemplateSchema>;
