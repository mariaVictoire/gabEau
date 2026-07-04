import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { getAgentDeliveries } from "@/actions/requests";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { redirect } from "next/navigation";
import { formatPrice, getOrderDisplay } from "@/lib/business-rules";

export default async function AgentDeliveriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/agent/login");

  const deliveries = await getAgentDeliveries(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mes livraisons aujourd&apos;hui</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {deliveries.length} livraison{deliveries.length !== 1 ? "s" : ""} assignée
          {deliveries.length !== 1 ? "s" : ""}
        </p>
      </div>

      {deliveries.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-500 font-medium">Aucune livraison pour aujourd&apos;hui</p>
          <p className="text-xs text-slate-400 mt-1">Revenez plus tard ou contactez votre coordinateur</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const order = getOrderDisplay(delivery);
            return (
            <Link key={delivery.id} href={`/agent/deliveries/${delivery.id}`}>
              <Card hover className="cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono font-bold text-gabon-green-dark text-sm">
                    {delivery.request_number}
                  </span>
                  <StatusBadge status={delivery.status} />
                </div>
                <p className="font-semibold text-slate-900">{delivery.full_name}</p>
                <p className="text-sm text-gabon-green font-medium">{delivery.phone}</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-gabon-green-light/50 px-3 py-2">
                  <span className="text-sm text-slate-600">{delivery.district}</span>
                  <span className="text-sm font-bold text-gabon-green-dark">
                    {formatPrice(order.price)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{order.label}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  📍 {delivery.address_landmark}
                </p>
                {delivery.is_urgent && (
                  <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                    🚨 URGENT
                  </span>
                )}
              </Card>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
