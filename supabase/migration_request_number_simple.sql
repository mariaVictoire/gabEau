-- Simplification du numéro de demande : EAU-154 (au lieu de EAU-2026-000154)
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
  next_num INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  INSERT INTO request_counters (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_number = request_counters.last_number + 1
  RETURNING last_number INTO next_num;
  NEW.request_number := 'EAU-' || next_num::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
