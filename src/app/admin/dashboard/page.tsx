export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAgentsWithWorkload, getDashboardReport, getDashboardStats, getRequests } from "@/actions/requests";
import { DashboardAnalytics } from "@/components/admin/DashboardAnalytics";
import { AgentWorkloadBar } from "@/components/admin/AgentWorkloadBar";
import { MAX_ASSIGNMENTS_PER_AGENT } from "@/lib/auto-assign";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/business-rules";

export default async function DashboardPage() {
  const [report, overview, recent, agents] = await Promise.all([
    getDashboardReport("week"),
    getDashboardStats(),
    getRequests(),
    getAgentsWithWorkload(),
  ]);
  const recentRequests = recent.slice(0, 6);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>

      <DashboardAnalytics initialReport={report} overview={overview}>
        <div className="space-y-6">
          {agents.length > 0 && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Charge des agents</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Livraisons en cours (max. {MAX_ASSIGNMENTS_PER_AGENT} par agent)
                  </p>
                </div>
                <Link
                  href="/admin/equipe"
                  className="text-xs font-semibold text-gabon-green hover:underline"
                >
                  Gérer →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map(({ agent, activeCount }) => (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-3"
                  >
                    <p className="font-semibold text-slate-900 text-sm truncate">{agent.full_name}</p>
                    {agent.agent_code && (
                      <p className="text-gabon-green-dark font-mono text-xs font-bold mt-0.5">
                        {agent.agent_code}
                      </p>
                    )}
                    <div className="mt-2">
                      <AgentWorkloadBar activeCount={activeCount} compact />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">Dernières demandes</h2>
              <Link href="/admin/requests" className="text-xs font-semibold text-gabon-green hover:underline">
                Voir tout →
              </Link>
            </div>
            {recentRequests.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Aucune demande pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {recentRequests.map((req) => (
                  <Link
                    key={req.id}
                    href="/admin/requests"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-gabon-green-light/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-gabon-green-dark">
                        {req.request_number}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {req.full_name} · {req.district}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={req.status} />
                      <p className="text-xs text-slate-400 mt-1">{formatDate(req.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DashboardAnalytics>
    </div>
  );
}
