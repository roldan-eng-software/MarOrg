-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles: users see their own profile; admin sees all
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- customers: all authenticated can list; only admin and commercial can create/edit
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- budgets: all authenticated can list; only admin and commercial can create/edit
CREATE POLICY "budgets_select" ON budgets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "budgets_insert" ON budgets
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "budgets_update" ON budgets
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- budget_items: inherits permissions from parent budget
CREATE POLICY "budget_items_select" ON budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND auth.role() = 'authenticated'
    )
  );

CREATE POLICY "budget_items_insert" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_update" ON budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_items_delete" ON budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_items.budget_id
      AND budgets.status = 'rascunho'
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

-- documents: all authenticated can view
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- communications: all authenticated can view; only admin and commercial can create
CREATE POLICY "communications_select" ON communications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "communications_insert" ON communications
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

-- audit_logs: only admin can view
CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
