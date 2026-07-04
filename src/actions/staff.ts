"use server";

import { getCurrentUser } from "@/actions/auth";
import {
  agentAuthEmail,
  extractAgentPrefix,
  formatAgentCode,
  generateAgentPin,
  isValidAgentCode,
  isValidAgentPin,
  parseAgentCodeNumber,
} from "@/lib/agent-auth";
import { getServiceClient, SUPABASE_CONFIG_MESSAGE } from "@/lib/supabase/service";
import type { User, UserRole } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || !["coordinator", "admin"].includes(user.role)) {
    return null;
  }
  return user;
}

async function generateUniqueAgentCode(
  supabase: SupabaseClient,
  fullName: string
): Promise<{ code: string; error?: string }> {
  const prefix = extractAgentPrefix(fullName);

  const { data, error } = await supabase
    .from("users")
    .select("agent_code")
    .like("agent_code", `${prefix}%`)
    .not("agent_code", "is", null);

  if (error) {
    if (error.message.includes("agent_code")) {
      return {
        code: "",
        error:
          "La colonne « code agent » est absente. Exécutez le fichier supabase/migration_agent_code.sql dans Supabase → SQL Editor, puis réessayez.",
      };
    }
    return { code: "", error: `Génération du code impossible : ${error.message}` };
  }

  let maxNum = 0;
  for (const row of data || []) {
    const num = parseAgentCodeNumber(row.agent_code as string, prefix);
    if (num !== null) maxNum = Math.max(maxNum, num);
  }

  return { code: formatAgentCode(prefix, maxNum + 1) };
}

export async function getStaffAgents(): Promise<User[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("role", "agent")
    .order("full_name");
  return (data as User[]) || [];
}

export async function createAgent(input: {
  full_name: string;
  phone?: string;
}): Promise<{
  success: boolean;
  error?: string;
  agent?: User;
  credentials?: { full_name: string; agent_code: string; pin: string; phone: string | null };
}> {
  const manager = await requireManager();
  if (!manager) {
    return { success: false, error: "Accès réservé au coordinateur ou administrateur." };
  }

  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: SUPABASE_CONFIG_MESSAGE };

  const full_name = input.full_name.trim();
  if (!full_name) {
    return { success: false, error: "Le nom de l'agent est obligatoire." };
  }

  const { code: agent_code, error: codeError } = await generateUniqueAgentCode(
    supabase,
    full_name
  );
  if (codeError || !agent_code) {
    return { success: false, error: codeError || "Impossible de générer le code agent." };
  }

  if (!isValidAgentCode(agent_code)) {
    return { success: false, error: "Code agent généré invalide. Essayez un nom plus long." };
  }

  const pin = generateAgentPin();
  if (!isValidAgentPin(pin)) {
    return { success: false, error: "Impossible de générer le PIN." };
  }

  const email = agentAuthEmail(agent_code);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: pin,
    email_confirm: true,
    user_metadata: { full_name, agent_code },
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return { success: false, error: "Ce code agent est déjà utilisé. Réessayez." };
    }
    return { success: false, error: `Création impossible : ${authError.message}` };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .upsert(
      {
        id: authData.user.id,
        full_name,
        email,
        agent_code,
        phone: input.phone?.trim() || null,
        role: "agent" as UserRole,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);

    if (profileError.message.includes("agent_code")) {
      return {
        success: false,
        error:
          "La colonne « code agent » est absente. Exécutez le fichier supabase/migration_agent_code.sql dans Supabase → SQL Editor, puis réessayez.",
      };
    }
    if (profileError.code === "23505") {
      return {
        success: false,
        error: "Ce code agent est déjà utilisé. Réessayez.",
      };
    }

    return {
      success: false,
      error: `Profil impossible à enregistrer : ${profileError.message}`,
    };
  }

  return {
    success: true,
    agent: profile as User,
    credentials: {
      full_name,
      agent_code,
      pin,
      phone: input.phone?.trim() || null,
    },
  };
}

export async function deleteAgent(
  agentId: string
): Promise<{ success: boolean; error?: string }> {
  const manager = await requireManager();
  if (!manager) {
    return { success: false, error: "Accès réservé au coordinateur ou administrateur." };
  }

  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: SUPABASE_CONFIG_MESSAGE };

  const { data: agent, error: fetchError } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("id", agentId)
    .single();

  if (fetchError || !agent) {
    return { success: false, error: "Agent introuvable." };
  }
  if (agent.role !== "agent") {
    return { success: false, error: "Seuls les agents livreurs peuvent être supprimés." };
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(agentId);

  if (authError) {
    const { error: profileError } = await supabase.from("users").delete().eq("id", agentId);
    if (profileError) {
      return { success: false, error: `Suppression impossible : ${authError.message}` };
    }
  }

  return { success: true };
}
