-- Tabela de cadastro de custos fixos/variáveis
CREATE TABLE costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('fixo', 'variavel')),
  default_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de aplicação de custos no orçamento
CREATE TABLE budget_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  cost_id UUID REFERENCES costs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  cost_type TEXT,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para costs
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "costs_select" ON costs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "costs_insert" ON costs
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial'));

CREATE POLICY "costs_update" ON costs
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

CREATE POLICY "costs_delete" ON costs
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- RLS para budget_costs
ALTER TABLE budget_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_costs_select" ON budget_costs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "budget_costs_insert" ON budget_costs
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial', 'producao'));

CREATE POLICY "budget_costs_update" ON budget_costs
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial', 'producao'));

CREATE POLICY "budget_costs_delete" ON budget_costs
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial', 'producao'));

-- Índices
CREATE INDEX idx_costs_active ON costs(active);
CREATE INDEX idx_budget_costs_budget ON budget_costs(budget_id);
CREATE INDEX idx_budget_costs_cost ON budget_costs(cost_id);
