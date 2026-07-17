import { z } from "zod";

export const customerSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(11, "Telefone deve ter no máximo 11 dígitos"),
  phone_secondary: z.string().optional().or(z.literal("")),
  cpf_cnpj: z.string().optional().or(z.literal("")),
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
  address_zip: z
    .string()
    .regex(/^\d{8}$/, "CEP deve ter 8 dígitos")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
