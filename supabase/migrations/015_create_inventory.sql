CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'geral' CHECK (category IN (
    'madeira', 'ferragem', 'acabamento', 'colante', 'vidro', 'fixacao', 'geral'
  )),
  unit TEXT NOT NULL DEFAULT 'un',
  current_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'reserva', 'liberacao')),
  quantity NUMERIC(12,3) NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_materials_name ON materials (name);
CREATE INDEX idx_materials_category ON materials (category);
CREATE INDEX idx_materials_active ON materials (active);
CREATE INDEX idx_stock_movements_material_id ON stock_movements (material_id);
CREATE INDEX idx_stock_movements_type ON stock_movements (movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements (created_at DESC);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "materials_insert" ON materials
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "materials_update" ON materials
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "materials_delete" ON materials
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "stock_movements_select" ON stock_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "stock_movements_insert" ON stock_movements
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial', 'producao')
  );
