CREATE TABLE payment_interest_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_type TEXT NOT NULL UNIQUE,
  monthly_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir valores default
INSERT INTO payment_interest_rates (payment_type, monthly_rate) VALUES
  ('PIX', 0),
  ('Boleto', 0),
  ('Cartão de Crédito', 2.99),
  ('Cartão de Débito', 0),
  ('Dinheiro', 0),
  ('Transferência', 0),
  ('Cheque', 0);

-- RLS
ALTER TABLE payment_interest_rates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'pir_select' AND tablename = 'payment_interest_rates') THEN
    CREATE POLICY "pir_select" ON payment_interest_rates FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "pir_insert" ON payment_interest_rates FOR INSERT TO authenticated WITH CHECK (public.user_role() IN ('admin', 'financeiro'));
    CREATE POLICY "pir_update" ON payment_interest_rates FOR UPDATE TO authenticated USING (public.user_role() IN ('admin', 'financeiro'));
    CREATE POLICY "pir_delete" ON payment_interest_rates FOR DELETE TO authenticated USING (public.user_role() IN ('admin', 'financeiro'));
  END IF;
END $$;
