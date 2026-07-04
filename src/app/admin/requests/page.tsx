"use client";

import { useEffect, useState, useTransition } from "react";
import { getRequests, searchRequests } from "@/actions/requests";
import { RequestDetailPanel } from "@/components/admin/RequestDetailPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DISTRICTS, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDate, formatPrice, getOrderDisplay } from "@/lib/business-rules";
import { exportToCSV, exportToPDF } from "@/lib/export";
import type { Request } from "@/lib/types";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selected, setSelected] = useState<Request | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    district: "",
    status: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
    urgentOnly: false,
  });
  const [isPending, startTransition] = useTransition();

  function loadRequests() {
    startTransition(async () => {
      const data = await getRequests(filters);
      setRequests(data);
      setSearchMode(false);
    });
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadRequests();
      return;
    }
    startTransition(async () => {
      const data = await searchRequests(searchQuery.trim());
      setRequests(data);
      setSearchMode(true);
      setSelected(null);
    });
  }

  function handleExportCSV() {
    exportToCSV(requests);
  }

  function handleExportPDF() {
    exportToPDF(requests);
  }

  function updateRequestInList(updated: Request) {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelected(updated);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Demandes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rechercher, consulter et exporter les demandes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none">
            Exporter CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex-1 sm:flex-none">
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Recherche rapide */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="N° de demande ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" loading={isPending} className="flex-1 sm:flex-none">
              Rechercher
            </Button>
            {searchMode && (
              <Button type="button" variant="secondary" onClick={loadRequests} className="flex-1 sm:flex-none">
                Tout afficher
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Filtres */}
      <Card>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full flex items-center justify-between font-semibold text-slate-900 min-h-[44px]"
        >
          Filtres avancés
          <span className="text-slate-400">{showFilters ? "▲" : "▼"}</span>
        </button>

        <div className={`${showFilters ? "block" : "hidden"} md:block ${showFilters ? "mt-4" : ""}`}>
          <p className="hidden md:block text-sm font-semibold text-slate-700 mb-3">Filtres avancés</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select
              label="Quartier"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              options={[{ value: "", label: "Tous" }, ...DISTRICTS.map((d) => ({ value: d, label: d }))]}
            />
            <Select
              label="Statut"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[{ value: "", label: "Tous" }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
            />
            <Select
              label="Priorité"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              options={[{ value: "", label: "Toutes" }, ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))]}
            />
            <Input
              label="Date début"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <Input
              label="Date fin"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 min-h-[48px] sm:mt-6">
              <input
                type="checkbox"
                checked={filters.urgentOnly}
                onChange={(e) => setFilters({ ...filters, urgentOnly: e.target.checked })}
                className="h-5 w-5 rounded accent-gabon-green"
              />
              Urgentes uniquement
            </label>
          </div>
          <Button onClick={loadRequests} loading={isPending} className="mt-4 w-full sm:w-auto">
            Appliquer les filtres
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Liste */}
        <div className={`space-y-2 ${selected ? "hidden lg:block" : ""}`}>
          <p className="text-sm font-semibold text-slate-500">
            {requests.length} demande{requests.length !== 1 ? "s" : ""}
            {searchMode ? " (recherche)" : ""}
          </p>
          {requests.length === 0 ? (
            <Card className="text-center py-10 text-slate-500">Aucune demande trouvée</Card>
          ) : (
            requests.map((req) => (
              <button
                key={req.id}
                type="button"
                onClick={() => setSelected(req)}
                className={`w-full text-left rounded-xl border p-4 transition-all min-h-[72px] active:scale-[0.99] ${
                  selected?.id === req.id
                    ? "border-gabon-green bg-gabon-green-light/40"
                    : "border-slate-200 bg-white hover:border-gabon-green/30"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-gabon-green-dark">
                    {req.request_number}
                  </span>
                  <StatusBadge status={req.status} />
                  {req.is_urgent && (
                    <span className="text-xs font-bold text-red-600">Urgente</span>
                  )}
                </div>
                <p className="font-medium text-slate-900 mt-1">{req.full_name}</p>
                <p className="text-sm text-slate-500">
                  {req.district} · {formatPrice(getOrderDisplay(req).price)}
                </p>
                <p className="text-xs text-slate-400 mt-1">{formatDate(req.created_at)}</p>
              </button>
            ))
          )}
        </div>

        {/* Détail */}
        {selected && (
          <RequestDetailPanel
            request={selected}
            onUpdate={updateRequestInList}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
