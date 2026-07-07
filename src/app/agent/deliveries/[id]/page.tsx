import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { DeliveryDetail } from "@/components/DeliveryDetail";
import type { Request } from "@/lib/types";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/agent/login");

  const { id } = await params;
  const supabase = getServiceClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .eq("assigned_agent_id", user.id)
    .single();

  if (!data) notFound();

  return <DeliveryDetail delivery={data as Request} agentId={user.id} />;
}
