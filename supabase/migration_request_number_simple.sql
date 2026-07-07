-- Simplification du numéro de demande : EAU-154 (au lieu de EAU-2026-000154)
-- À exécuter dans Supabase → SQL Editor (une fois).

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

-- Aligner le compteur sur les demandes déjà en base (y compris ancien format).
INSERT INTO request_counters (year, last_number)
SELECT
  EXTRACT(YEAR FROM NOW())::INTEGER,
  COALESCE(
    MAX(
      CASE
        WHEN request_number ~ '^EAU-[0-9]+$' THEN
          NULLIF(regexp_replace(request_number, '^EAU-', ''), '')::INTEGER
        WHEN request_number ~ '^EAU-[0-9]{4}-[0-9]+$' THEN
          NULLIF(regexp_replace(request_number, '^EAU-[0-9]{4}-0*', ''), '')::INTEGER
        ELSE 0
      END
    ),
    0
  )
FROM requests
ON CONFLICT (year) DO UPDATE
SET last_number = GREATEST(request_counters.last_number, EXCLUDED.last_number);
