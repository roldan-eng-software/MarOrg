-- Tabela de transações financeiras (fluxo de caixa)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  entity_type TEXT,
  entity_id UUID,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para transações financeiras
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_transactions" ON financial_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_transactions" ON financial_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "authenticated_update_transactions" ON financial_transactions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete_transactions" ON financial_transactions
  FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX idx_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_transactions_status ON financial_transactions(status);
CREATE INDEX idx_transactions_due_date ON financial_transactions(due_date);
CREATE INDEX idx_transactions_category ON financial_transactions(category);
CREATE INDEX idx_transactions_created ON financial_transactions(created_at DESC);

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
