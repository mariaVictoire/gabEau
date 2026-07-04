-- Permet à chaque utilisateur connecté de lire son propre profil
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
