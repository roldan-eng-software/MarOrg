-- Create budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN (
    'rascunho', 'enviado', 'em_analise', 'aprovado', 'recusado', 'vencido', 'revisado'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  validity_days INTEGER NOT NULL DEFAULT 30,
  notes_internal TEXT,
  notes_client TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  refused_at TIMESTAMPTZ
);

-- Triggers
CREATE TRIGGER tr_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to prevent editing approved/refused budgets
CREATE OR REPLACE FUNCTION prevent_budget_edit_after_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('aprovado', 'recusado', 'vencido') THEN
    RAISE EXCEPTION 'Não é possível editar orçamento com status %', OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_prevent_budget_edit
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION prevent_budget_edit_after_decision();

-- Indexes
CREATE INDEX idx_budgets_customer_id ON budgets (customer_id);
CREATE INDEX idx_budgets_status ON budgets (status);
CREATE INDEX idx_budgets_created_at ON budgets (created_at DESC);
CREATE INDEX idx_budgets_budget_number ON budgets (budget_number);
