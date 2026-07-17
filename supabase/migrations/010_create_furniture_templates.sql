CREATE TABLE furniture_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  default_material TEXT,
  default_unit TEXT NOT NULL DEFAULT 'un',
  default_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  default_width_cm NUMERIC(8,2),
  default_depth_cm NUMERIC(8,2),
  default_height_cm NUMERIC(8,2),
  default_finish TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_furniture_templates_category ON furniture_templates (category);
CREATE INDEX idx_furniture_templates_name ON furniture_templates (name);
CREATE INDEX idx_furniture_templates_active ON furniture_templates (active) WHERE active = true;

CREATE TRIGGER tr_furniture_templates_updated_at
  BEFORE UPDATE ON furniture_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE furniture_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "furniture_templates_select" ON furniture_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "furniture_templates_insert" ON furniture_templates
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "furniture_templates_update" ON furniture_templates
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "furniture_templates_delete" ON furniture_templates
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
