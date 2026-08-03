ALTER TABLE budget_requests
  ADD COLUMN IF NOT EXISTS customer_cpf TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('apartamento', 'casa', 'comercio')),
  ADD COLUMN IF NOT EXISTS finish_color TEXT,
  ADD COLUMN IF NOT EXISTS project_context TEXT CHECK (project_context IN ('novo', 'substituir', 'reforma'));