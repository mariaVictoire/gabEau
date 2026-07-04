# Gab'Eau

Application web de gestion des demandes de livraison d'eau d'urgence à Libreville.

## Stack technique

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage)

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Copiez `.env.local.example` vers `.env.local` et renseignez vos clés
3. Exécutez le script SQL dans `supabase/schema.sql` via l'éditeur SQL Supabase
4. Créez un bucket Storage nommé `delivery-proofs` (public)

### 3. Créer les utilisateurs staff

Dans Supabase Auth, créez des utilisateurs puis insérez leurs profils :

```sql
INSERT INTO users (id, full_name, email, role, phone) VALUES
  ('UUID_FROM_AUTH', 'Marie Opératrice', 'operateur@gabeau.ga', 'operator', '061234567'),
  ('UUID_FROM_AUTH', 'Jean Coordinateur', 'coordinateur@gabeau.ga', 'coordinator', '062345678'),
  ('UUID_FROM_AUTH', 'Paul Agent', 'agent@gabeau.ga', 'agent', '063456789');
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Formulaire de demande citoyen |
| `/confirmation/[requestNumber]` | Confirmation après soumission |
| `/track` | Suivi de demande |
| `/admin/login` | Connexion staff |
| `/admin/operator` | Interface Opérateur 18 |
| `/admin/dashboard` | Tableau de bord coordinateur |
| `/admin/requests` | Liste et filtres des demandes |
| `/admin/assignments` | Assignation aux agents |
| `/agent/login` | Connexion agent |
| `/agent/deliveries` | Livraisons du jour |
| `/agent/deliveries/[id]` | Détail livraison |
| `/agent/history` | Historique agent |

## Rôles

- **Citoyen** : soumet et suit une demande sans compte
- **Opérateur 18** : recherche, commente, met à jour le statut
- **Coordinateur** : tableau de bord, filtres, assignation, export
- **Agent** : livraisons assignées, confirmation avec preuve photo

## Règles métier

- Volume estimé : 1-3 pers. = 50L, 4-6 = 100L, 7+ = 150L
- Priorité haute si plus d'eau + personnes vulnérables
- Numéro de demande : `EAU-YYYY-000001`
