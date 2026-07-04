-- Code agent pour connexion sans email
-- Exécuter dans Supabase → SQL Editor (une seule fois)

ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_agent_code_key ON users (agent_code) WHERE agent_code IS NOT NULL;

-- Exemple pour un agent déjà créé manuellement :
-- UPDATE users SET agent_code = 'AG001' WHERE email = 'agent@gabeau.ga';
