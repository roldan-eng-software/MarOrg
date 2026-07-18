CREATE TABLE service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  budget_id UUID NOT NULL REFERENCES budgets(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'em_producao', 'acabamento', 'pronto', 'entregue', 'cancelada'
  )),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN (
    'baixa', 'normal', 'alta', 'urgente'
  )),
  start_date DATE,
  estimated_delivery DATE,
  actual_delivery DATE,
  responsible TEXT,
  notes_internal TEXT,
  notes_production TEXT,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_service_orders_updated_at
  BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE service_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES budget_items(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('mobiliario', 'servico')),
  description TEXT NOT NULL,
  material TEXT,
  width_cm NUMERIC(8,2),
  depth_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  finish TEXT,
  unit TEXT NOT NULL DEFAULT 'un',
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_orders_budget_id ON service_orders (budget_id);
CREATE INDEX idx_service_orders_customer_id ON service_orders (customer_id);
CREATE INDEX idx_service_orders_status ON service_orders (status);
CREATE INDEX idx_service_orders_created_at ON service_orders (created_at DESC);
CREATE INDEX idx_service_orders_order_number ON service_orders (order_number);
CREATE INDEX idx_service_order_items_so_id ON service_order_items (service_order_id);

ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_orders_select" ON service_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "service_orders_insert" ON service_orders
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "service_orders_update" ON service_orders
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial', 'producao')
  );

CREATE POLICY "service_order_items_select" ON service_order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "service_order_items_insert" ON service_order_items
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );

CREATE POLICY "service_order_items_update" ON service_order_items
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial', 'producao')
  );

CREATE POLICY "service_order_items_delete" ON service_order_items
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
  );
