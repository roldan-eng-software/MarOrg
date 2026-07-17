import { z } from "zod";

export const budgetItemSchema = z.object({
  id: z.string().uuid().optional(),
  item_type: z.enum(["mobiliario", "servico"], {
    required_error: "Selecione o tipo",
  }),
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  material: z.string().optional().or(z.literal("")),
  width_cm: z.coerce.number().positive("Largura deve ser positiva").optional(),
  depth_cm: z.coerce.number().positive("Profundidade deve ser positiva").optional(),
  height_cm: z.coerce.number().positive("Altura deve ser positiva").optional(),
  finish: z.string().optional().or(z.literal("")),
  unit: z.string().min(1, "Unidade é obrigatória"),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unit_price: z.coerce.number().positive("Preço unitário deve ser positivo"),
  discount: z.coerce.number().min(0, "Desconto não pode ser negativo").default(0),
  notes: z.string().optional().or(z.literal("")),
  sort_order: z.number().default(0),
});

export type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

export const budgetSchema = z.object({
  customer_id: z.string().uuid("Selecione um cliente"),
  validity_days: z.coerce.number().min(1).max(365).default(30),
  delivery_days: z.coerce.number().min(0).max(365).default(30),
  notes_internal: z.string().optional().or(z.literal("")),
  notes_client: z.string().optional().or(z.literal("")),
  payment_conditions: z.string().optional().or(z.literal("")),
  payment_installments: z.array(z.object({
    installment: z.number(),
    description: z.string(),
    due_date: z.string(),
    percentage: z.coerce.number().min(0).max(100),
  })).default([]),
  payment_types: z.array(z.string()).default([]),
  items: z
    .array(budgetItemSchema)
    .min(1, "Adicione pelo menos um item ao orçamento"),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
