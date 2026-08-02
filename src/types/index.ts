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

export interface Contract {
  id: string;
  service_order_id: string;
  customer_id: string;
  template_path: string;
  content_final: string;
  status: 'draft' | 'generated' | 'sent' | 'signed';
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  phone_secondary: string | null;
  cpf_cnpj: string | null;
  nationality: string | null;
  marital_status: string | null;
  profession: string | null;
  rg: string | null;
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
    | "revisado"
    | "concluido";
  version: number;
  validity_days: number;
  delivery_days: number;
  production_days: number;
  warranty_months: number | null;
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
  raw_material_cost: number;
  overhead_cost: number;
  profit_margin: number;
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
  payment_type: string;
}

export interface PaymentInterestRate {
  id: string;
  payment_type: string;
  monthly_rate: number;
  active: boolean;
  created_at: string;
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
  sheet_width_mm: number | null;
  sheet_height_mm: number | null;
  waste_percent: number | null;
  price_per_unit: number | null;
  roll_length_mm: number | null;
  is_sheet: boolean;
  is_edgeband: boolean;
}

export interface TemplatePart {
  id: string;
  template_id: string;
  part_type: "mdf" | "fita_borda" | "ferragem" | "mao_obra";
  material_id: string | null;
  name: string;
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
  quantity: number;
  has_edgeband: boolean;
  edgeband_sides: string[];
  sort_order: number;
  created_at: string;
}

export interface TemplateCostBreakdown {
  mdfCost: number;
  edgebandCost: number;
  hardwareCost: number;
  laborCost: number;
  totalCost: number;
  details: {
    mdfAreaLiquida: number;
    mdfAreaComPerda: number;
    edgebandPerimeter: number;
    hardwareItems: { name: string; quantity: number; cost: number }[];
  };
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

export interface ServiceOrderItemMaterial {
  id: string;
  service_order_item_id: string;
  material_id: string;
  quantity: number;
  created_at: string;
}

export interface BudgetItemMaterial {
  id: string;
  budget_item_id: string;
  material_id: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
}

export interface Cost {
  id: string;
  name: string;
  description: string | null;
  cost_type: "fixo" | "variavel";
  default_value: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface BudgetCost {
  id: string;
  budget_id: string;
  cost_id: string | null;
  name: string;
  cost_type: string | null;
  value: number;
  quantity: number;
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

export interface BudgetRequest {
  id: string;
  request_number: string;
  status: "pendente" | "convertido";
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  preferred_channel: "whatsapp" | "email" | null;
  furniture_type: string;
  furniture_other: string | null;
  environment: string;
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
  materials: string[];
  hardware: string[];
  additional_description: string | null;
  budget_range: string | null;
  needs_3d_project: boolean;
  needs_technical_visit: boolean;
  image_urls: string[];
  created_at: string;
  converted_at: string | null;
  converted_budget_id: string | null;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  event_type: "reuniao" | "visita" | "followup" | "outro";
  color: string;
  entity_type: string | null;
  entity_id: string | null;
  customer_id: string | null;
  completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
