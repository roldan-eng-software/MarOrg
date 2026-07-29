-- Fix: budget_items_delete RLS policy was too restrictive
-- It only allowed deletion when budget status = 'rascunho'
-- But the app allows editing budgets in 'rascunho', 'enviado', 'em_analise', 'revisado'
-- This caused silent RLS rejection -> old items stay + new items inserted = duplication

DROP POLICY IF EXISTS "budget_items_delete" ON budget_items;

CREATE POLICY "budget_items_delete" ON budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND budgets.status IN ('rascunho', 'enviado', 'em_analise', 'revisado')
      AND public.user_role() IN ('admin', 'comercial')
    )
  );
