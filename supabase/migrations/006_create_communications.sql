-- Create communications table
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  document_id UUID REFERENCES documents(id),
  entity_type TEXT,
  entity_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  sent_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_communications_entity ON communications (entity_type, entity_id);
CREATE INDEX idx_communications_customer_id ON communications (entity_id);
CREATE INDEX idx_communications_created_at ON communications (created_at DESC);
