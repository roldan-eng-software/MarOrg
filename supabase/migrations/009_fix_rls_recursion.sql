-- Fix: infinite recursion in profiles RLS policies
-- The policies were doing subqueries on profiles itself, causing infinite recursion.
-- Solution: create a SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "budgets_insert" ON budgets;
DROP POLICY IF EXISTS "budgets_update" ON budgets;
DROP POLICY IF EXISTS "budget_items_insert" ON budget_items;
DROP POLICY IF EXISTS "budget_items_update" ON budget_items;
DROP POLICY IF EXISTS "budget_items_delete" ON budget_items;
DROP POLICY IF EXISTS "documents_insert" ON documents;
DROP POLICY IF EXISTS "communications_insert" ON communications;
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;

-- profiles: users see their own profile; admin sees all
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    public.user_role() = 'admin'
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    public.user_role() = 'admin'
  );

-- customers: only admin and commercial can create/edit
CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (
    public.user_role() IN ('admin', 'comercial')
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (
    public.user_role() IN ('admin', 'comercial')
  );

-- budgets: only admin and commercial can create/edit
CREATE POLICY "budgets_insert" ON budgets
  FOR INSERT WITH CHECK (
    public.user_role() IN ('admin', 'comercial')
  );

CREATE POLICY "budgets_update" ON budgets
  FOR UPDATE USING (
    public.user_role() IN ('admin', 'comercial')
  );

-- budget_items: inherits permissions from parent budget
CREATE POLICY "budget_items_insert" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND public.user_role() IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_update" ON budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND public.user_role() IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_delete" ON budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND budgets.status = 'rascunho'
      AND public.user_role() IN ('admin', 'comercial')
    )
  );

-- documents: only admin and commercial can create
CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    public.user_role() IN ('admin', 'comercial')
  );

-- communications: only admin and commercial can create
CREATE POLICY "communications_insert" ON communications
  FOR INSERT WITH CHECK (
    public.user_role() IN ('admin', 'comercial')
  );

-- audit_logs: only admin can view
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    public.user_role() = 'admin'
  );
