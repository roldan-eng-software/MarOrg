CREATE TABLE share_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('budget', 'contract')),
  entity_id UUID NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_tokens_token ON share_tokens (token);
CREATE INDEX idx_share_tokens_entity ON share_tokens (entity_type, entity_id);

ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'share_tokens_public_select' AND tablename = 'share_tokens') THEN
    CREATE POLICY "share_tokens_public_select" ON share_tokens FOR SELECT USING (true);
    CREATE POLICY "share_tokens_auth_insert" ON share_tokens FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "share_tokens_auth_update" ON share_tokens FOR UPDATE TO authenticated USING (true);
    CREATE POLICY "share_tokens_auth_delete" ON share_tokens FOR DELETE TO authenticated USING (true);
  END IF;
END $$;