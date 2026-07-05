"use server";

import { createClient } from "@/lib/supabase/server";
import {
  agentAuthEmail,
  isValidAgentCode,
  isValidAgentPin,
  normalizeAgentCode,
} from "@/lib/agent-auth";
import { getServiceClient } from "@/lib/supabase/service";
import type { User, UserRole } from "@/lib/types";

async function signInAndGetRole(
  email: string,
  password: string,
  invalidCredentialsMessage: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const code = error.message.toLowerCase();
    if (code.includes("email not confirmed")) {
      return {
        success: false,
        error:
          "Compte non confirmé. Dans Supabase → Authentication → Users, vérifiez que l'utilisateur est confirmé.",
      };
    }
    if (code.includes("invalid login credentials") || code.includes("invalid credentials")) {
      return { success: false, error: invalidCredentialsMessage };
    }
    return { success: false, error: `Connexion impossible : ${error.message}` };
  }

  const admin = getServiceClient();
  if (!admin) {
    return { success: false, error: "Supabase n'est pas configuré côté serveur." };
  }

  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    return {
      success: false,
      error:
        "Profil utilisateur introuvable. Exécutez le SQL de création de profil dans Supabase (voir README).",
    };
  }

  return { success: true, role: profile.role as UserRole };
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> {
  return signInAndGetRole(
    email,
    password,
    "Email ou mot de passe incorrect. Réinitialisez le mot de passe dans Supabase → Authentication → Users."
  );
}

export async function loginAgent(
  agentCode: string,
  pin: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> {
  const code = normalizeAgentCode(agentCode);
  const trimmedPin = pin.trim();

  if (!isValidAgentCode(code)) {
    return { success: false, error: "Code agent invalide." };
  }
  if (!isValidAgentPin(trimmedPin)) {
    return { success: false, error: "Code PIN invalide (4 à 6 chiffres)." };
  }

  return signInAndGetRole(
    agentAuthEmail(code),
    trimmedPin,
    "Code agent ou PIN incorrect."
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getServiceClient();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as User | null;
}

const STAFF_ROLES: UserRole[] = ["operator", "coordinator", "admin"];

export async function requireStaffUser(): Promise<
  { user: User } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { error: "Session expirée. Reconnectez-vous sur /admin/login." };
  }

  const admin = getServiceClient();
  if (!admin) {
    return { error: "Supabase n'est pas configuré côté serveur." };
  }

  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    return {
      error:
        "Profil introuvable. Créez votre profil dans Supabase (table users) avec le rôle operator, coordinator ou admin.",
    };
  }

  if (profile.role === "agent") {
    return {
      error:
        "Compte agent détecté. Connectez-vous avec un compte opérateur ou coordinateur via /admin/login.",
    };
  }

  if (!STAFF_ROLES.includes(profile.role as UserRole)) {
    return { error: "Accès réservé au personnel Gab'Eau." };
  }

  return { user: profile as User };
}
