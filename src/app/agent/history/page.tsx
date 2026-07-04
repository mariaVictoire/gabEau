import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { getAgentHistory } from "@/actions/requests";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/business-rules";
import { redirect } from "next/navigation";

export default async function AgentHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/agent/login");

  const history = await getAgentHistory(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Historique des livraisons</h1>

      {history.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">Aucune livraison dans l&apos;historique.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((delivery) => (
            <Link key={delivery.id} href={`/agent/deliveries/${delivery.id}`}>
              <Card className="hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-blue-700">
                      {delivery.request_number}
                    </span>
                    <p className="font-medium mt-1">{delivery.full_name}</p>
                    <p className="text-sm text-gray-500">{delivery.district}</p>
                  </div>
                  <StatusBadge status={delivery.status} />
                </div>
                {delivery.delivered_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(delivery.delivered_at)}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
