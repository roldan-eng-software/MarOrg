ALTER TABLE budgets
  ADD COLUMN payment_conditions TEXT,
  ADD COLUMN payment_installments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN payment_types JSONB DEFAULT '[]'::jsonb;
