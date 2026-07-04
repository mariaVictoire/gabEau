function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes("your-project") || value.includes("your-");
}

export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || isPlaceholder(url)) {
    return "NEXT_PUBLIC_SUPABASE_URL est manquante ou incorrecte dans .env.local";
  }
  if (!anon || isPlaceholder(anon)) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante dans .env.local";
  }
  if (!serviceKey || isPlaceholder(serviceKey)) {
    return "SUPABASE_SERVICE_ROLE_KEY est manquante. Dans Supabase → Settings → API → copiez la clé service_role (Reveal).";
  }
  return null;
}

export const SUPABASE_CONFIG_MESSAGE =
  "Supabase n'est pas configuré. Vérifiez les 3 clés dans .env.local puis redémarrez npm run dev.";

/** Safe to use in client components (NEXT_PUBLIC_* only). */
export function hasPublicSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!anon && !isPlaceholder(url) && !isPlaceholder(anon);
}

export function isSupabaseFullyConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    !!key &&
    !!anon &&
    !isPlaceholder(url) &&
    !isPlaceholder(key) &&
    !isPlaceholder(anon)
  );
}
