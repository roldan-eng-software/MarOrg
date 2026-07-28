ALTER TABLE budgets
  DROP CONSTRAINT IF EXISTS budgets_status_check;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_status_check
  CHECK (status IN ('rascunho', 'enviado', 'em_analise', 'aprovado', 'recusado', 'vencido', 'revisado', 'concluido'));

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS concluded_at TIMESTAMPTZ;
