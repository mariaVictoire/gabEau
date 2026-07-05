function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes("your-project") || value.includes("your-");
}

function configLocationHint(): string {
  if (typeof window !== "undefined") {
    return process.env.NODE_ENV === "production"
      ? "Vercel → Settings → Environment Variables, puis redéployez"
      : ".env.local puis redémarrez npm run dev";
  }
  if (process.env.VERCEL) {
    return "Vercel → Settings → Environment Variables, puis redéployez";
  }
  return ".env.local puis redémarrez npm run dev";
}

export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const where = configLocationHint();

  if (!url || isPlaceholder(url)) {
    return `NEXT_PUBLIC_SUPABASE_URL est manquante ou incorrecte (${where})`;
  }
  if (!anon || isPlaceholder(anon)) {
    return `NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante (${where})`;
  }
  if (!serviceKey || isPlaceholder(serviceKey)) {
    return `SUPABASE_SERVICE_ROLE_KEY est manquante (${where}). Dans Supabase → Settings → API → service_role (Reveal).`;
  }
  return null;
}

export function getSupabaseConfigMessage(): string {
  return `Supabase n'est pas configuré. Ajoutez les 3 clés dans ${configLocationHint()}.`;
}

export const SUPABASE_CONFIG_MESSAGE = getSupabaseConfigMessage();

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
