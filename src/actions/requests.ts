"use server";

import { requireStaffUser } from "@/actions/auth";
import { autoAssignRequest, assignRequestToAgent, getAgentAssignmentCounts } from "@/lib/auto-assign";
import { calculateOrder, calculatePriority, formatPhone } from "@/lib/business-rules";
import {
  getServiceClient,
  getSupabaseConfigError,
  SUPABASE_CONFIG_MESSAGE,
} from "@/lib/supabase/service";
import type { CreateRequestInput, Request, User } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

async function insertRequest(
  supabase: SupabaseClient,
  input: CreateRequestInput,
  options: { operatorId?: string; source: "web" | "phone" }
): Promise<{ success: true; request: Request } | { success: false; error: string }> {
  const phone = formatPhone(input.phone);
  const priority = calculatePriority();
  const { estimated_volume_liters, price_fcfa } = calculateOrder(
    input.product_type,
    input.quantity
  );

  const { data, error } = await supabase
    .from("requests")
    .insert({
      request_number: "",
      full_name: input.full_name,
      phone,
      district: input.district,
      address_landmark: input.address_landmark,
      household_size: 1,
      situation: "no_water",
      has_children: false,
      has_elderly: false,
      has_sick: false,
      comment: input.comment || null,
      product_type: input.product_type,
      quantity: input.quantity,
      price_fcfa,
      estimated_volume_liters,
      priority,
      status: "received",
    })
    .select()
    .single();

  if (error) {
    console.error("createRequest error:", error);
    return { success: false, error: "Erreur lors de la création de la demande." };
  }

  const createdComment =
    options.source === "phone"
      ? "Demande enregistrée par l'opérateur (appel 18)"
      : "Demande créée par le citoyen";

  await supabase.from("request_events").insert({
    request_id: data.id,
    event_type: "created",
    new_status: "received",
    comment: createdComment,
    created_by: options.operatorId ?? null,
  });

  await autoAssignRequest(supabase, data.id);

  const { data: finalRequest } = await supabase
    .from("requests")
    .select("*, assigned_agent:users!assigned_agent_id(id, full_name, agent_code)")
    .eq("id", data.id)
    .single();

  return { success: true, request: (finalRequest ?? data) as Request };
}

export async function createRequest(
  input: CreateRequestInput
): Promise<{ success: true; request: Request } | { success: false; error: string }> {
  try {
    const supabase = getServiceClient();
    if (!supabase) {
      return {
        success: false,
        error: getSupabaseConfigError() ?? SUPABASE_CONFIG_MESSAGE,
      };
    }
    return insertRequest(supabase, input, { source: "web" });
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export async function createPhoneOrder(
  input: CreateRequestInput
): Promise<{ success: true; request: Request } | { success: false; error: string }> {
  try {
    const staff = await requireStaffUser();
    if ("error" in staff) {
      return { success: false, error: staff.error };
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return {
        success: false,
        error: getSupabaseConfigError() ?? SUPABASE_CONFIG_MESSAGE,
      };
    }

    return insertRequest(supabase, input, { operatorId: staff.user.id, source: "phone" });
  } catch {
    return { success: false, error: "Erreur serveur." };
  }
}

export async function getRequestByNumber(
  requestNumber: string
): Promise<Request | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("request_number", requestNumber.toUpperCase())
    .single();
  return data as Request | null;
}

export async function trackRequest(
  requestNumber: string,
  phone: string
): Promise<Request | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  const formattedPhone = formatPhone(phone);
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("request_number", requestNumber.toUpperCase())
    .eq("phone", formattedPhone)
    .single();
  return data as Request | null;
}

export async function getPreviousRequestByPhone(
  phone: string
): Promise<Partial<CreateRequestInput> | null> {
  try {
    const supabase = getServiceClient();
    if (!supabase) return null;
    const formattedPhone = formatPhone(phone);
    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("phone", formattedPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    return {
      full_name: data.full_name,
      phone: data.phone,
      district: data.district,
      address_landmark: data.address_landmark,
      product_type: data.product_type,
      quantity: data.quantity,
    };
  } catch {
    return null;
  }
}

export async function searchRequests(
  query: string
): Promise<Request[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const formattedQuery = query.trim();
  const formattedPhone = formatPhone(formattedQuery);

  const { data: byNumber } = await supabase
    .from("requests")
    .select("*")
    .eq("request_number", formattedQuery.toUpperCase());

  if (byNumber && byNumber.length > 0) return byNumber as Request[];

  const { data: byPhone } = await supabase
    .from("requests")
    .select("*")
    .eq("phone", formattedPhone)
    .order("created_at", { ascending: false });

  return (byPhone as Request[]) || [];
}

export async function getRequests(filters?: {
  district?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  urgentOnly?: boolean;
}): Promise<Request[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];
  let query = supabase.from("requests").select("*, assigned_agent:users!assigned_agent_id(*)");

  if (filters?.district) query = query.eq("district", filters.district);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.priority) query = query.eq("priority", filters.priority);
  if (filters?.urgentOnly) query = query.eq("is_urgent", true);
  if (filters?.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("created_at", filters.dateTo + "T23:59:59");

  const { data } = await query.order("created_at", { ascending: false });
  return (data as Request[]) || [];
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: string,
  userId: string,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: SUPABASE_CONFIG_MESSAGE };

  const { data: current } = await supabase
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "delivered") updates.delivered_at = new Date().toISOString();

  const { error } = await supabase
    .from("requests")
    .update(updates)
    .eq("id", requestId);

  if (error) return { success: false, error: error.message };

  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "status_change",
    old_status: current?.status,
    new_status: newStatus,
    comment,
    created_by: userId,
  });

  return { success: true };
}

export async function addRequestComment(
  requestId: string,
  comment: string,
  userId: string
): Promise<{ success: boolean }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false };
  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "comment",
    comment,
    created_by: userId,
  });
  return { success: true };
}

export async function toggleUrgent(
  requestId: string,
  isUrgent: boolean,
  userId: string
): Promise<{ success: boolean }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false };
  await supabase.from("requests").update({ is_urgent: isUrgent }).eq("id", requestId);
  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "priority_change",
    comment: isUrgent ? "Marquée urgente" : "Urgence retirée",
    created_by: userId,
  });
  return { success: true };
}

export async function assignRequests(
  requestIds: string[],
  agentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false, error: SUPABASE_CONFIG_MESSAGE };

  const { data: agent } = await supabase
    .from("users")
    .select("id, full_name, agent_code")
    .eq("id", agentId)
    .single();

  if (!agent) {
    return { success: false, error: "Agent introuvable." };
  }

  return assignRequestToAgent(supabase, requestIds, agent, { userId });
}

export async function getRequestEvents(requestId: string) {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("request_events")
    .select("*, created_by_user:users!created_by(*)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getDashboardStats() {
  const supabase = getServiceClient();
  if (!supabase) {
    return { total: 0, pending: 0, assigned: 0, delivered: 0, urgent: 0, byDistrict: [] };
  }
  const { data: all } = await supabase.from("requests").select("status, district, is_urgent");

  if (!all) return { total: 0, pending: 0, assigned: 0, delivered: 0, urgent: 0, byDistrict: [] };

  const pending = all.filter((r) =>
    ["received", "in_review"].includes(r.status)
  ).length;
  const assigned = all.filter((r) =>
    ["assigned", "in_progress"].includes(r.status)
  ).length;
  const delivered = all.filter((r) => r.status === "delivered").length;
  const urgent = all.filter((r) => r.is_urgent).length;

  const districtMap = new Map<string, number>();
  for (const r of all) {
    districtMap.set(r.district, (districtMap.get(r.district) || 0) + 1);
  }
  const byDistrict = Array.from(districtMap.entries())
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: all.length,
    pending,
    assigned,
    delivered,
    urgent,
    byDistrict,
  };
}

export async function getAgents() {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("role", "agent")
    .order("full_name");
  return data || [];
}

export async function getAgentsWithWorkload(): Promise<
  { agent: User; activeCount: number }[]
> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  const [agents, counts] = await Promise.all([
    getAgents(),
    getAgentAssignmentCounts(supabase),
  ]);

  return agents.map((agent) => ({
    agent: agent as User,
    activeCount: counts.get(agent.id) || 0,
  }));
}

export async function getAgentDeliveries(agentId: string, todayOnly = true) {
  const supabase = getServiceClient();
  if (!supabase) return [];
  let query = supabase
    .from("requests")
    .select("*")
    .eq("assigned_agent_id", agentId)
    .in("status", ["assigned", "in_progress"]);

  if (todayOnly) {
    const today = new Date().toISOString().split("T")[0];
    query = query.gte("updated_at", today);
  }

  const { data } = await query.order("priority", { ascending: false });
  return (data as Request[]) || [];
}

export async function getAgentHistory(agentId: string) {
  const supabase = getServiceClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("assigned_agent_id", agentId)
    .in("status", ["delivered", "failed_delivery"])
    .order("delivered_at", { ascending: false })
    .limit(50);
  return (data as Request[]) || [];
}

export async function startDelivery(
  requestId: string,
  agentId: string
): Promise<{ success: boolean }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false };
  await supabase
    .from("requests")
    .update({ status: "in_progress" })
    .eq("id", requestId);
  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "delivery_started",
    new_status: "in_progress",
    created_by: agentId,
  });
  return { success: true };
}

export async function completeDelivery(
  requestId: string,
  agentId: string,
  personMetName: string,
  comment?: string,
  photoUrl?: string
): Promise<{ success: boolean }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false };
  const now = new Date().toISOString();

  await supabase.from("delivery_proofs").insert({
    request_id: requestId,
    agent_id: agentId,
    person_met_name: personMetName,
    comment: comment || null,
    photo_url: photoUrl || null,
    delivered_at: now,
  });

  await supabase
    .from("requests")
    .update({ status: "delivered", delivered_at: now })
    .eq("id", requestId);

  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "delivery_completed",
    new_status: "delivered",
    comment: `Livré à ${personMetName}`,
    created_by: agentId,
  });

  return { success: true };
}

export async function failDelivery(
  requestId: string,
  agentId: string,
  comment?: string
): Promise<{ success: boolean }> {
  const supabase = getServiceClient();
  if (!supabase) return { success: false };
  await supabase
    .from("requests")
    .update({ status: "failed_delivery" })
    .eq("id", requestId);
  await supabase.from("request_events").insert({
    request_id: requestId,
    event_type: "delivery_failed",
    new_status: "failed_delivery",
    comment: comment || "Échec de livraison",
    created_by: agentId,
  });
  return { success: true };
}

export async function uploadDeliveryPhoto(
  file: File,
  requestId: string
): Promise<string | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  const ext = file.name.split(".").pop();
  const path = `${requestId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("delivery-proofs")
    .upload(path, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from("delivery-proofs").getPublicUrl(path);
  return data.publicUrl;
}
