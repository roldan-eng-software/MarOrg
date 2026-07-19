-- Tabela de eventos da agenda (compromissos avulsos)
CREATE TABLE IF NOT EXISTS schedule_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  event_type TEXT NOT NULL CHECK (event_type IN ('reuniao', 'visita', 'followup', 'outro')),
  color TEXT DEFAULT '#5B3A29',
  entity_type TEXT,
  entity_id UUID,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_events" ON schedule_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_events" ON schedule_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "authenticated_update_events" ON schedule_events
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_delete_events" ON schedule_events
  FOR DELETE TO authenticated USING (true);

-- Índices
CREATE INDEX idx_events_date ON schedule_events(event_date);
CREATE INDEX idx_events_type ON schedule_events(event_type);
CREATE INDEX idx_events_customer ON schedule_events(customer_id);

-- Trigger updated_at
CREATE TRIGGER update_schedule_events_updated_at
  BEFORE UPDATE ON schedule_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
