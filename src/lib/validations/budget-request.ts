import { z } from "zod";

export const budgetRequestSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .min(10, "WhatsApp deve ter pelo menos 10 dígitos")
    .max(11, "WhatsApp deve ter no máximo 11 dígitos"),
  canal_preferido: z.enum(["whatsapp", "email"], {
    errorMap: () => ({ message: "Selecione o canal preferido" }),
  }),
  tipo_movel: z.enum(
    [
      "Cozinha planejada",
      "Guarda-roupa",
      "Home office",
      "Closet",
      "Estante / Rack",
      "Outro",
    ],
    {
      errorMap: () => ({ message: "Selecione o tipo de móvel" }),
    }
  ),
  tipo_movel_outro: z.string().optional().or(z.literal("")),
  ambiente: z.string().min(1, "Informe o ambiente de instalação"),
  largura_cm: z.coerce.number().positive("Largura deve ser positiva").optional(),
  altura_cm: z.coerce.number().positive("Altura deve ser positiva").optional(),
  profundidade_cm: z.coerce.number().positive("Profundidade deve ser positiva").optional(),
  materiais: z.array(z.string()).default([]),
  ferragens: z.array(z.string()).default([]),
  descricao: z.string().optional().or(z.literal("")),
  faixa_orcamento: z.string().optional(),
  projeto_3d: z.boolean().default(false),
  visita_tecnica: z.boolean().default(false),
  privacidade: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você precisa concordar com a política de privacidade",
    })
    .default(false),
});

export type BudgetRequestFormData = z.infer<typeof budgetRequestSchema>;