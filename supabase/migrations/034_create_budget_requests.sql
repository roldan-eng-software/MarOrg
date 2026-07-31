CREATE TABLE budget_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'convertido')),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  preferred_channel TEXT CHECK (preferred_channel IN ('whatsapp', 'email')),
  furniture_type TEXT NOT NULL,
  furniture_other TEXT,
  environment TEXT NOT NULL,
  width_cm NUMERIC,
  height_cm NUMERIC,
  depth_cm NUMERIC,
  materials TEXT[] DEFAULT '{}',
  hardware TEXT[] DEFAULT '{}',
  additional_description TEXT,
  budget_range TEXT,
  needs_3d_project BOOLEAN DEFAULT false,
  needs_technical_visit BOOLEAN DEFAULT false,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  converted_budget_id UUID REFERENCES budgets(id)
);

CREATE INDEX idx_budget_requests_status ON budget_requests (status);
CREATE INDEX idx_budget_requests_number ON budget_requests (request_number);

ALTER TABLE budget_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'budget_requests_public_insert' AND tablename = 'budget_requests') THEN
    CREATE POLICY "budget_requests_public_insert" ON budget_requests FOR INSERT WITH CHECK (true);
    CREATE POLICY "budget_requests_auth_select" ON budget_requests FOR SELECT TO authenticated USING (true);
    CREATE POLICY "budget_requests_auth_update" ON budget_requests FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;