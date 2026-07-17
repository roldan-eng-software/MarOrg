export interface Profile {
  id: string;
  full_name: string;
  role: "admin" | "comercial" | "financeiro" | "producao";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  phone_secondary: string | null;
  cpf_cnpj: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  budget_number: string;
  customer_id: string;
  status:
    | "rascunho"
    | "enviado"
    | "em_analise"
    | "aprovado"
    | "recusado"
    | "vencido"
    | "revisado";
  version: number;
  validity_days: number;
  delivery_days: number;
  notes_internal: string | null;
  notes_client: string | null;
  total_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  refused_at: string | null;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  item_type: "mobiliario" | "servico";
  description: string;
  material: string | null;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  finish: string | null;
  unit: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface Document {
  id: string;
  document_type: "orcamento" | "ordem_servico" | "contrato" | "recibo";
  file_name: string;
  storage_path: string;
  mime_type: string;
  version: number;
  entity_type: string;
  entity_id: string;
  customer_id: string;
  file_size: number | null;
  generated_by: string;
  created_at: string;
}

export interface Communication {
  id: string;
  channel: "email" | "whatsapp";
  recipient: string;
  subject: string | null;
  message: string;
  document_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: "pending" | "success" | "failed";
  error_message: string | null;
  sent_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface FurnitureTemplate {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  default_material: string | null;
  default_unit: string;
  default_price: number;
  default_width_cm: number | null;
  default_depth_cm: number | null;
  default_height_cm: number | null;
  default_finish: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
