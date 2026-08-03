import { z } from "zod";

const cpfCnpjRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$|^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;

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
  customer_cpf: z
    .string()
    .regex(cpfCnpjRegex, "CPF/CNPJ inválido")
    .optional()
    .or(z.literal("")),
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
  largura_cm: z.coerce.number().positive("Largura deve ser positiva"),
  altura_cm: z.coerce.number().positive("Altura deve ser positiva"),
  profundidade_cm: z.coerce.number().positive("Profundidade deve ser positiva"),
  materiais: z.array(z.string()).default([]),
  ferragens: z.array(z.string()).default([]),
  finish_color: z.string().optional().or(z.literal("")),
  project_context: z.enum(["novo", "substituir", "reforma"], {
    errorMap: () => ({ message: "Selecione o contexto do projeto" }),
  }),
  descricao: z.string().optional().or(z.literal("")),
  faixa_orcamento: z.string().optional(),
  projeto_3d: z.boolean().default(false),
  visita_tecnica: z.boolean().default(false),
  address_zip: z
    .string()
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
    .optional()
    .or(z.literal("")),
  address_street: z.string().optional().or(z.literal("")),
  address_number: z.string().optional().or(z.literal("")),
  address_complement: z.string().optional().or(z.literal("")),
  address_neighborhood: z.string().optional().or(z.literal("")),
  address_city: z.string().optional().or(z.literal("")),
  address_state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres (UF)")
    .optional()
    .or(z.literal("")),
  property_type: z.enum(["apartamento", "casa", "comercio"], {
    errorMap: () => ({ message: "Selecione o tipo de imóvel" }),
  }),
  privacidade: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você precisa concordar com a política de privacidade",
    })
    .default(false),
});

export type BudgetRequestFormData = z.infer<typeof budgetRequestSchema>;