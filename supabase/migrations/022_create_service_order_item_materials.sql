CREATE TABLE service_order_item_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_item_id UUID NOT NULL REFERENCES service_order_items(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id),
  quantity NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_soim_item ON service_order_item_materials(service_order_item_id);
CREATE INDEX idx_soim_material ON service_order_item_materials(material_id);

ALTER TABLE service_order_item_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "soim_select" ON service_order_item_materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "soim_insert" ON service_order_item_materials
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('admin', 'comercial', 'producao'));

CREATE POLICY "soim_update" ON service_order_item_materials
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial', 'producao'));

CREATE POLICY "soim_delete" ON service_order_item_materials
  FOR DELETE TO authenticated
  USING (public.user_role() IN ('admin', 'comercial', 'producao'));
