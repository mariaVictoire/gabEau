export const dynamic = "force-dynamic";

import Link from "next/link";
import { getDashboardStats, getRequests } from "@/actions/requests";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, getOrderDisplay } from "@/lib/business-rules";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recent = (await getRequests()).slice(0, 6);
  const deliveryRate =
    stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue d&apos;ensemble de l&apos;activité Gab&apos;Eau
          </p>
        </div>
        <Link
          href="/admin/assignments"
          className="inline-flex items-center justify-center rounded-xl bg-gabon-green px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gabon-green-dark transition-colors min-h-[44px]"
        >
          Assigner des livraisons →
        </Link>
      </div>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="!p-4 border-l-4 border-l-gabon-blue">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">demandes enregistrées</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            À traiter
          </p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-1">reçues ou en examen</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-violet-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            En livraison
          </p>
          <p className="text-3xl font-extrabold text-violet-600 mt-1">{stats.assigned}</p>
          <p className="text-xs text-slate-500 mt-1">assignées ou en cours</p>
        </Card>
        <Card className="!p-4 border-l-4 border-l-gabon-green">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Livrées
          </p>
          <p className="text-3xl font-extrabold text-gabon-green mt-1">{stats.delivered}</p>
          <p className="text-xs text-slate-500 mt-1">{deliveryRate} % du total</p>
        </Card>
      </div>

      {/* Barre de progression */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-slate-900">Taux de livraison</h2>
          <span className="text-sm font-bold text-gabon-green">{deliveryRate} %</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gabon-green to-gabon-blue rounded-full transition-all"
            style={{ width: `${deliveryRate}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
          <span>Livrées : <strong className="text-slate-700">{stats.delivered}</strong></span>
          <span>En cours : <strong className="text-slate-700">{stats.assigned}</strong></span>
          <span>À traiter : <strong className="text-slate-700">{stats.pending}</strong></span>
          {stats.urgent > 0 && (
            <span className="text-red-600 font-semibold">
              Urgentes : {stats.urgent}
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dernières demandes */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900">Dernières demandes</h2>
            <Link href="/admin/requests" className="text-xs font-semibold text-gabon-green hover:underline">
              Voir tout →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune demande pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((req) => (
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

        {/* Par quartier */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 mb-1">Demandes par quartier</h2>
          <p className="text-xs text-slate-400 mb-4">Top quartiers</p>
          {stats.byDistrict.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {stats.byDistrict.slice(0, 8).map(({ district, count }) => (
                <div key={district} className="flex items-center gap-3">
                  <span className="w-24 sm:w-28 text-sm font-medium text-slate-700 truncate shrink-0">
                    {district}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-gabon-green to-gabon-blue h-2.5 rounded-full"
                      style={{ width: `${Math.max(4, (count / stats.total) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-6 text-right shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
