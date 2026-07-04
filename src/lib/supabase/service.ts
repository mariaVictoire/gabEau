import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isSupabaseFullyConfigured,
  getSupabaseConfigError,
  SUPABASE_CONFIG_MESSAGE,
} from "@/lib/supabase/config";

export { SUPABASE_CONFIG_MESSAGE, getSupabaseConfigError };

export function isSupabaseConfigured(): boolean {
  return isSupabaseFullyConfigured();
}

export function getServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
