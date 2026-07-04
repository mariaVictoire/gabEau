-- Gab'Eau - Schéma de base de données
-- Exécuter ce script dans l'éditeur SQL Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('operator', 'coordinator', 'agent', 'admin');
CREATE TYPE request_status AS ENUM (
  'received',
  'in_review',
  'assigned',
  'in_progress',
  'delivered',
  'cancelled',
  'failed_delivery'
);
CREATE TYPE request_situation AS ENUM ('no_water', 'low_stock', 'preventive');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE event_type AS ENUM (
  'created',
  'status_change',
  'comment',
  'priority_change',
  'assignment',
  'delivery_started',
  'delivery_completed',
  'delivery_failed'
);

-- Compteur pour numéros de demande
CREATE TABLE request_counters (
  year INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- Utilisateurs (staff)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  agent_code TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demandes citoyennes
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  address_landmark TEXT NOT NULL,
  household_size INTEGER NOT NULL CHECK (household_size > 0),
  situation request_situation NOT NULL,
  has_children BOOLEAN NOT NULL DEFAULT FALSE,
  has_elderly BOOLEAN NOT NULL DEFAULT FALSE,
  has_sick BOOLEAN NOT NULL DEFAULT FALSE,
  comment TEXT,
  product_type TEXT NOT NULL DEFAULT 'cubic_meter',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_fcfa INTEGER NOT NULL DEFAULT 3000,
  estimated_volume_liters INTEGER NOT NULL,
  status request_status NOT NULL DEFAULT 'received',
  priority request_priority NOT NULL DEFAULT 'medium',
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Historique des événements
CREATE TABLE request_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  old_status request_status,
  new_status request_status,
  comment TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preuves de livraison
CREATE TABLE delivery_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_met_name TEXT NOT NULL,
  comment TEXT,
  photo_url TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fonction : générer le numéro de demande EAU-YYYY-000001
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
  NEW.request_number := 'EAU-' || current_year || '-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION generate_request_number();

-- Fonction : mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_requests_phone ON requests(phone);
CREATE INDEX idx_requests_request_number ON requests(request_number);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_district ON requests(district);
CREATE INDEX idx_requests_assigned_agent ON requests(assigned_agent_id);
CREATE INDEX idx_request_events_request_id ON request_events(request_id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique des demandes par numéro (via service role pour tracking)
-- Les citoyens utilisent les server actions avec service role ou des fonctions RPC

-- Staff peut lire les users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can read users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'agent', 'admin')
    )
  );

-- Staff peut lire toutes les demandes
CREATE POLICY "Staff can read requests" ON requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'agent', 'admin')
    )
  );

-- Agents voient leurs demandes assignées
CREATE POLICY "Agents see assigned requests" ON requests
  FOR SELECT TO authenticated
  USING (
    assigned_agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'admin')
    )
  );

-- Opérateurs/coordinateurs peuvent modifier les demandes
CREATE POLICY "Staff can update requests" ON requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'admin', 'agent')
    )
  );

-- Insertion publique via service role (server actions)
CREATE POLICY "Service role insert requests" ON requests
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- Events : staff peut lire et insérer
CREATE POLICY "Staff can read events" ON request_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'agent', 'admin')
    )
  );

CREATE POLICY "Staff can insert events" ON request_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'agent', 'admin')
    )
  );

-- Delivery proofs
CREATE POLICY "Staff can read proofs" ON delivery_proofs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('operator', 'coordinator', 'agent', 'admin')
    )
  );

CREATE POLICY "Agents can insert proofs" ON delivery_proofs
  FOR INSERT TO authenticated
  WITH CHECK (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('coordinator', 'admin')
    )
  );

-- Bucket storage pour photos de livraison (à créer dans Supabase Dashboard)
-- Nom du bucket : delivery-proofs (public ou signed URLs)

-- Données de démonstration (utilisateurs à créer via Auth d'abord)
-- Voir README pour les instructions de configuration
