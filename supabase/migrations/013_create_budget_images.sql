CREATE TABLE budget_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budget_images_budget_id ON budget_images (budget_id);

ALTER TABLE budget_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_images_select" ON budget_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_images.budget_id
      AND auth.role() = 'authenticated'
    )
  );

CREATE POLICY "budget_images_insert" ON budget_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_images.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );

CREATE POLICY "budget_images_delete" ON budget_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = budget_images.budget_id
      AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
    )
  );
