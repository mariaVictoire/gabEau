-- Bucket Storage pour signatures (et anciennes photos) de livraison
-- Exécuter dans Supabase → SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'delivery-proofs',
  'delivery-proofs',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lecture publique des preuves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read delivery proofs'
  ) THEN
    CREATE POLICY "Public read delivery proofs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'delivery-proofs');
  END IF;
END $$;

-- Écriture via service role (bypass RLS) ; politique pour authenticated si besoin futur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service insert delivery proofs'
  ) THEN
    CREATE POLICY "Service insert delivery proofs"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'delivery-proofs');
  END IF;
END $$;
