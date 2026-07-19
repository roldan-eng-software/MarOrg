export interface Profile {
  id: string;
  full_name: string;
  role: "admin" | "comercial" | "financeiro" | "producao";
  active: boolean;
  settings: {
    company_name?: string;
    company_phone?: string;
    company_address?: string;
    company_cnpj?: string;
    company_email?: string;
  };
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
  payment_conditions: string | null;
  payment_installments: PaymentInstallment[];
  payment_types: string[];
  deposit_percentage: number | null;
  installment_count: number | null;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  item_type: "mobiliario" | "servico";
  description: string;
  material: string | null;
  material_id: string | null;
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

export interface PaymentInstallment {
  installment: number;
  description: string;
  due_date: string;
  percentage: number;
}

export interface BudgetImage {
  id: string;
  budget_id: string;
  image_url: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  budget_id: string;
  customer_id: string;
  status: "pendente" | "em_producao" | "acabamento" | "pronto" | "entregue" | "cancelada";
  priority: "baixa" | "normal" | "alta" | "urgente";
  start_date: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  responsible: string | null;
  notes_internal: string | null;
  notes_production: string | null;
  total_amount: number;
  deposit_percentage: number | null;
  installment_count: number | null;
  deposit_value: number;
  installment_value: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceOrderItem {
  id: string;
  service_order_id: string;
  budget_item_id: string | null;
  item_type: "mobiliario" | "servico";
  description: string;
  material: string | null;
  material_id: string | null;
  width_cm: number | null;
  depth_cm: number | null;
  height_cm: number | null;
  finish: string | null;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  category: "madeira" | "ferragem" | "acabamento" | "colante" | "vidro" | "fixacao" | "geral";
  unit: string;
  current_stock: number;
  min_stock: number;
  cost: number;
  supplier: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  material_id: string;
  movement_type: "entrada" | "saida" | "ajuste" | "reserva" | "liberacao";
  quantity: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  service_order_item_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  notes: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string | null;
  budget_id: string | null;
  description: string;
  total_amount: number;
  status: "pendente" | "aprovada" | "entregue" | "cancelada";
  due_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
