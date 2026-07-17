-- Create budget_items table
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('mobiliario', 'servico')),
  description TEXT NOT NULL CHECK (LENGTH(description) >= 3),
  material TEXT,
  width_cm NUMERIC(8,2),
  depth_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  finish TEXT,
  unit TEXT NOT NULL DEFAULT 'un',
  quantity NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price > 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to calculate total_price
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price := (NEW.quantity * NEW.unit_price) - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_budget_item_calculate_total
  BEFORE INSERT OR UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION calculate_item_total();

-- Trigger to calculate budget total_amount
CREATE OR REPLACE FUNCTION calculate_budget_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budgets
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM budget_items
    WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
  )
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_budget_items_total
  AFTER INSERT OR UPDATE OR DELETE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION calculate_budget_total();

-- Index
CREATE INDEX idx_budget_items_budget_id ON budget_items (budget_id);
