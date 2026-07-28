CREATE OR REPLACE FUNCTION prevent_budget_edit_after_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('aprovado', 'recusado', 'vencido', 'concluido') THEN
    IF OLD.status = 'aprovado' AND NEW.status = 'concluido' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Não é possível editar orçamento com status %', OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
