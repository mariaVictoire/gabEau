-- Migration : options de commande (m³ et bidons 200 L)
-- Exécuter dans Supabase SQL si la table requests existe déjà

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'cubic_meter',
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  ADD COLUMN IF NOT EXISTS price_fcfa INTEGER NOT NULL DEFAULT 3000;

-- Mettre à jour les anciennes demandes sans prix
UPDATE requests
SET
  product_type = 'cubic_meter',
  quantity = 1,
  price_fcfa = 3000
WHERE price_fcfa IS NULL OR price_fcfa = 0;
