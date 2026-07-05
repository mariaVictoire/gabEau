import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@/lib/types";

export const MAX_ASSIGNMENTS_PER_AGENT = 10;

export const ACTIVE_ASSIGNMENT_STATUSES = ["assigned", "in_progress"] as const;

export async function getAgentAssignmentCounts(
  supabase: SupabaseClient
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("requests")
    .select("assigned_agent_id")
    .in("status", [...ACTIVE_ASSIGNMENT_STATUSES])
    .not("assigned_agent_id", "is", null);

  const counts = new Map<string, number>();
  for (const row of data || []) {
    const id = row.assigned_agent_id as string;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

export async function getAvailableAgents(
  supabase: SupabaseClient
): Promise<{ agent: User; activeCount: number }[]> {
  const [{ data: agents }, counts] = await Promise.all([
    supabase.from("users").select("*").eq("role", "agent").order("full_name"),
    getAgentAssignmentCounts(supabase),
  ]);

  if (!agents?.length) return [];

  return (agents as User[])
    .map((agent) => ({
      agent,
      activeCount: counts.get(agent.id) || 0,
    }))
    .filter(({ activeCount }) => activeCount < MAX_ASSIGNMENTS_PER_AGENT)
    .sort(
      (a, b) =>
        a.activeCount - b.activeCount ||
        a.agent.full_name.localeCompare(b.agent.full_name, "fr")
    );
}

export async function pickAgentForAssignment(
  supabase: SupabaseClient
): Promise<User | null> {
  const available = await getAvailableAgents(supabase);
  return available[0]?.agent ?? null;
}

export function formatAgentLabel(agent: {
  full_name: string;
  agent_code?: string | null;
}): string {
  return agent.agent_code
    ? `${agent.full_name} (${agent.agent_code})`
    : agent.full_name;
}

export async function assignRequestToAgent(
  supabase: SupabaseClient,
  requestIds: string[],
  agent: Pick<User, "id" | "full_name" | "agent_code">,
  options: {
    userId?: string | null;
    automatic?: boolean;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  if (requestIds.length === 0) {
    return { success: false, error: "Aucune demande à assigner." };
  }

  const counts = await getAgentAssignmentCounts(supabase);
  const current = counts.get(agent.id) || 0;

  if (current + requestIds.length > MAX_ASSIGNMENTS_PER_AGENT) {
    const remaining = MAX_ASSIGNMENTS_PER_AGENT - current;
    return {
      success: false,
      error:
        remaining <= 0
          ? `Cet agent a déjà ${MAX_ASSIGNMENTS_PER_AGENT} livraisons en cours.`
          : `Cet agent ne peut recevoir que ${remaining} demande(s) de plus (max. ${MAX_ASSIGNMENTS_PER_AGENT}).`,
    };
  }

  const agentLabel = formatAgentLabel(agent);
  const comment = options.automatic
    ? `Assignée automatiquement à ${agentLabel}`
    : `Assignée à ${agentLabel}`;

  const { error } = await supabase
    .from("requests")
    .update({
      assigned_agent_id: agent.id,
      status: "assigned",
    })
    .in("id", requestIds);

  if (error) return { success: false, error: error.message };

  for (const id of requestIds) {
    await supabase.from("request_events").insert({
      request_id: id,
      event_type: "assignment",
      new_status: "assigned",
      comment,
      created_by: options.userId ?? null,
    });
  }

  return { success: true };
}

export async function autoAssignRequest(
  supabase: SupabaseClient,
  requestId: string
): Promise<boolean> {
  const agent = await pickAgentForAssignment(supabase);
  if (!agent) return false;

  const result = await assignRequestToAgent(supabase, [requestId], agent, {
    automatic: true,
  });
  return result.success;
}
