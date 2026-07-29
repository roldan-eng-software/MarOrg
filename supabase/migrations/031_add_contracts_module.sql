-- Adiciona campos de dados pessoais à tabela de clientes para o módulo de contratos
ALTER TABLE customers ADD COLUMN nationality TEXT;
ALTER TABLE customers ADD COLUMN marital_status TEXT;
ALTER TABLE customers ADD COLUMN profession TEXT;
ALTER TABLE customers ADD COLUMN rg TEXT;

-- Adiciona campo de garantia à tabela de orçamentos
ALTER TABLE budgets ADD COLUMN warranty_months INTEGER;

-- Cria a tabela de contratos
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  template_path TEXT NOT NULL,
  content_final TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona RLS (Row Level Security) à tabela de contratos
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Permite que o administrador tenha acesso total
CREATE POLICY "Allow full access to admin" ON contracts
FOR ALL
TO service_role
USING (true);

-- Permite que usuários autenticados vejam e criem seus próprios contratos
CREATE POLICY "Allow individual access to authenticated users" ON contracts
FOR ALL
USING (auth.uid() = (SELECT created_by FROM customers WHERE id = contracts.customer_id));
