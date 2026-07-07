-- Signature du bénéficiaire sur les preuves de livraison
ALTER TABLE delivery_proofs
  ADD COLUMN IF NOT EXISTS signature_url TEXT;
