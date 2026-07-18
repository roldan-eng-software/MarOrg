-- ============================================================
-- CORREÇÃO DE SEGURANÇA: RLS Policies
-- ============================================================

-- 1. CORRIGIR suppliers: UPDATE e DELETE devem ser admin-only
DROP POLICY IF EXISTS "authenticated_update_suppliers" ON suppliers;
DROP POLICY IF EXISTS "authenticated_delete_suppliers" ON suppliers;

CREATE POLICY "admin_update_suppliers" ON suppliers
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin'));

CREATE POLICY "admin_delete_suppliers" ON suppliers
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin'));

-- 2. CORRIGIR purchases: UPDATE e DELETE devem ser admin-only
DROP POLICY IF EXISTS "authenticated_update_purchases" ON purchases;
DROP POLICY IF EXISTS "authenticated_delete_purchases" ON purchases;

CREATE POLICY "admin_update_purchases" ON purchases
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin'));

CREATE POLICY "admin_delete_purchases" ON purchases
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin'));

-- 3. CORRIGIR financial_transactions: UPDATE/DELETE admin e financeiro
DROP POLICY IF EXISTS "authenticated_update_transactions" ON financial_transactions;
DROP POLICY IF EXISTS "authenticated_delete_transactions" ON financial_transactions;

CREATE POLICY "admin_financeiro_update_transactions" ON financial_transactions
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'financeiro'));

CREATE POLICY "admin_financeiro_delete_transactions" ON financial_transactions
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin', 'financeiro'));

-- 4. Adicionar INSERT policy admin/comercial para suppliers
DROP POLICY IF EXISTS "authenticated_insert_suppliers" ON suppliers;
CREATE POLICY "admin_comercial_insert_suppliers" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial'));

-- 5. Adicionar INSERT policy admin/comercial para purchases
DROP POLICY IF EXISTS "authenticated_insert_purchases" ON purchases;
CREATE POLICY "admin_comercial_insert_purchases" ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial'));

-- 6. Adicionar INSERT policy admin/financeiro para financial_transactions
DROP POLICY IF EXISTS "authenticated_insert_transactions" ON financial_transactions;
CREATE POLICY "admin_financeiro_insert_transactions" ON financial_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'financeiro'));

-- 7. Adicionar INSERT policy para audit_logs (admin only)
DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin'));

-- 8. Adicionar UPDATE policy para customers (admin/comercial)
DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "admin_comercial_update_customers" ON customers
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- 9. Adicionar UPDATE policy para budgets (admin/comercial)
DROP POLICY IF EXISTS "budgets_update" ON budgets;
CREATE POLICY "admin_comercial_update_budgets" ON budgets
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- 10. Adicionar UPDATE policy para documents (admin/comercial)
DROP POLICY IF EXISTS "documents_update" ON documents;
CREATE POLICY "admin_comercial_update_documents" ON documents
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- 11. Adicionar DELETE policy para documents (admin only)
DROP POLICY IF EXISTS "documents_delete" ON documents;
CREATE POLICY "admin_delete_documents" ON documents
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin'));

-- 12. Adicionar UPDATE/DELETE policy para communications (admin/comercial)
DROP POLICY IF EXISTS "communications_update" ON communications;
CREATE POLICY "admin_comercial_update_communications" ON communications
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

DROP POLICY IF EXISTS "communications_delete" ON communications;
CREATE POLICY "admin_comercial_delete_communications" ON communications
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- 13. Adicionar UPDATE policy para stock_movements (admin/comercial/producao)
DROP POLICY IF EXISTS "stock_movements_update" ON stock_movements;
CREATE POLICY "admin_comercial_producao_update_stock_movements" ON stock_movements
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial', 'producao'));

-- 14. Adicionar DELETE policy para stock_movements (admin only)
DROP POLICY IF EXISTS "stock_movements_delete" ON stock_movements;
CREATE POLICY "admin_delete_stock_movements" ON stock_movements
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin'));

-- 15. Adicionar DELETE policy para materials (admin only)
DROP POLICY IF EXISTS "materials_delete" ON materials;
CREATE POLICY "admin_delete_materials" ON materials
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin'));

-- 16. Adicionar UPDATE policy para materials (admin/comercial)
DROP POLICY IF EXISTS "materials_update" ON materials;
CREATE POLICY "admin_comercial_update_materials" ON materials
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial'));

-- 17. Adicionar INSERT policy para materials (admin/comercial)
DROP POLICY IF EXISTS "materials_insert" ON materials;
CREATE POLICY "admin_comercial_insert_materials" ON materials
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial'));

-- 18. Adicionar INSERT policy para stock_movements (admin/comercial/producao)
DROP POLICY IF EXISTS "stock_movements_insert" ON stock_movements;
CREATE POLICY "admin_comercial_producao_insert_stock_movements" ON stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial', 'producao'));
