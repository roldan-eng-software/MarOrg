ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);
ALTER TABLE service_order_items ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES materials(id);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS service_order_item_id UUID REFERENCES service_order_items(id);

CREATE INDEX IF NOT EXISTS idx_budget_items_material_id ON budget_items(material_id);
CREATE INDEX IF NOT EXISTS idx_service_order_items_material_id ON service_order_items(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_so_item ON stock_movements(service_order_item_id);
