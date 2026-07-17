-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('orcamento', 'ordem_servico', 'contrato', 'recibo')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  version INTEGER NOT NULL DEFAULT 1,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  file_size INTEGER,
  generated_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_entity ON documents (entity_type, entity_id);
CREATE INDEX idx_documents_customer_id ON documents (customer_id);
CREATE INDEX idx_documents_created_at ON documents (created_at DESC);
