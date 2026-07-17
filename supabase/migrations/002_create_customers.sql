-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (LENGTH(full_name) >= 2),
  email TEXT,
  phone TEXT NOT NULL,
  phone_secondary TEXT,
  cpf_cnpj TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT CHECK (LENGTH(address_state) = 2),
  address_zip TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_customers_full_name ON customers (full_name);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_cpf_cnpj ON customers (cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;
CREATE INDEX idx_customers_active ON customers (active) WHERE active = true;
