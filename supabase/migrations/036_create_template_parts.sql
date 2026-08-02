CREATE TABLE furniture_template_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES furniture_templates(id) ON DELETE CASCADE,
  part_type TEXT NOT NULL CHECK (part_type IN ('mdf', 'fita_borda', 'ferragem', 'mao_obra')),
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  width_mm NUMERIC,
  height_mm NUMERIC,
  depth_mm NUMERIC,
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  has_edgeband BOOLEAN DEFAULT false,
  edgeband_sides JSONB DEFAULT '["all"]',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_parts_template ON furniture_template_parts (template_id);
CREATE INDEX idx_template_parts_material ON furniture_template_parts (material_id);

ALTER TABLE furniture_template_parts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'template_parts_select' AND tablename = 'furniture_template_parts') THEN
    CREATE POLICY "template_parts_select" ON furniture_template_parts FOR SELECT USING (true);
    CREATE POLICY "template_parts_insert" ON furniture_template_parts FOR INSERT TO authenticated WITH CHECK (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'comercial')
    ));
    CREATE POLICY "template_parts_update" ON furniture_template_parts FOR UPDATE TO authenticated USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'comercial')
    ));
    CREATE POLICY "template_parts_delete" ON furniture_template_parts FOR DELETE TO authenticated USING (EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'comercial')
    ));
  END IF;
END $$;