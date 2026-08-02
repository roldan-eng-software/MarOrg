ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS sheet_width_mm NUMERIC,
  ADD COLUMN IF NOT EXISTS sheet_height_mm NUMERIC,
  ADD COLUMN IF NOT EXISTS waste_percent NUMERIC(5,2) DEFAULT 15,
  ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS roll_length_mm NUMERIC,
  ADD COLUMN IF NOT EXISTS is_sheet BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_edgeband BOOLEAN DEFAULT false;

COMMENT ON COLUMN materials.sheet_width_mm IS 'Largura da chapa em milimetros (ex: 2750)';
COMMENT ON COLUMN materials.sheet_height_mm IS 'Altura da chapa em milimetros (ex: 1850)';
COMMENT ON COLUMN materials.waste_percent IS 'Percentual de perda/refugo no corte (padrao: 15%)';
COMMENT ON COLUMN materials.price_per_unit IS 'Preco por unidade de medida (m2 para chapas, metro linear para fitas)';
COMMENT ON COLUMN materials.roll_length_m IS 'Comprimento do rolo em metros (para fita de borda)';
COMMENT ON COLUMN materials.is_sheet IS 'Indica se este material e uma chapa (MDF, MDP, etc.)';
COMMENT ON COLUMN materials.is_edgeband IS 'Indica se este material e fita de borda';