-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de compras
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_number TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  total_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'entregue', 'cancelada')),
  due_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para fornecedores
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_suppliers" ON suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_suppliers" ON suppliers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "authenticated_update_suppliers" ON suppliers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete_suppliers" ON suppliers
  FOR DELETE TO authenticated USING (true);

-- RLS para compras
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_purchases" ON purchases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_purchases" ON purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "authenticated_update_purchases" ON purchases
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete_purchases" ON purchases
  FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX idx_suppliers_active ON suppliers(active);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created ON purchases(created_at DESC);
