"use client";

import { useEffect, useState, useTransition } from "react";
import { assignRequests, getAgentsWithWorkload, getRequests } from "@/actions/requests";
import { getCurrentUser } from "@/actions/auth";
import { AgentWorkloadBar } from "@/components/admin/AgentWorkloadBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MAX_ASSIGNMENTS_PER_AGENT } from "@/lib/auto-assign";
import { formatPrice, getOrderDisplay } from "@/lib/business-rules";
import type { Request, User } from "@/lib/types";

type AgentWorkload = { agent: User; activeCount: number };

export default function AssignmentsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [agentId, setAgentId] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function loadPending() {
    startTransition(async () => {
      const [received, inReview, agts] = await Promise.all([
        getRequests({ status: "received" }),
        getRequests({ status: "in_review" }),
        getAgentsWithWorkload(),
      ]);
      setRequests([...received, ...inReview]);
      setAgents(agts);
    });
  }

  useEffect(() => {
    startTransition(async () => {
      const [received, inReview, agts] = await Promise.all([
        getRequests({ status: "received" }),
        getRequests({ status: "in_review" }),
        getAgentsWithWorkload(),
      ]);
      setRequests([...received, ...inReview]);
      setAgents(agts);
      const firstAvailable = agts.find((a) => a.activeCount < MAX_ASSIGNMENTS_PER_AGENT);
      if (firstAvailable) setAgentId(firstAvailable.agent.id);
    });
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === requests.length) setSelected(new Set());
    else setSelected(new Set(requests.map((r) => r.id)));
  }

  function handleAssign() {
    if (selected.size === 0) {
      setMessage("Sélectionnez au moins une demande.");
      return;
    }
    if (!agentId) {
      setMessage("Choisissez un agent livreur.");
      return;
    }

    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const result = await assignRequests(Array.from(selected), agentId, user.id);

      if (result.success) {
        setMessage(`${selected.size} demande(s) assignée(s).`);
        setSelected(new Set());
        loadPending();
      } else {
        setMessage(result.error || "Erreur lors de l'assignation.");
      }
    });
  }

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Assigner les livraisons</h1>
        <p className="text-sm text-slate-500 mt-1">
          Les nouvelles commandes sont assignées automatiquement (max. {MAX_ASSIGNMENTS_PER_AGENT}{" "}
          par agent). Réassignez ici si besoin.
        </p>
      </div>

      {agents.length > 0 && (
        <Card>
          <h2 className="font-bold text-slate-900 mb-3">Charge des agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map(({ agent, activeCount }) => (
              <div
                key={agent.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3"
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-slate-900">
            Demandes à assigner ({requests.length})
          </h2>
          {requests.length > 0 && (
            <button
              type="button"
              onClick={selectAll}
              className="text-sm font-semibold text-gabon-green hover:underline min-h-[44px]"
            >
              {selected.size === requests.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {requests.map((req) => {
            const order = getOrderDisplay(req);
            const isSelected = selected.has(req.id);
            return (
              <label
                key={req.id}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all min-h-[80px] active:scale-[0.99] ${
                  isSelected
                    ? "border-gabon-green bg-gabon-green-light/40 ring-1 ring-gabon-green/20"
                    : "border-slate-200 hover:border-gabon-green/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(req.id)}
                  className="mt-1 h-5 w-5 shrink-0 accent-gabon-green"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-gabon-green-dark">
                      {req.request_number}
                    </span>
                    <StatusBadge status={req.status} />
                    {req.is_urgent && (
                      <span className="text-xs font-bold text-red-600">Urgente</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 mt-1">{req.full_name}</p>
                  <p className="text-sm text-slate-600">
                    {req.district} · {req.phone}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {req.address_landmark}
                  </p>
                  <p className="text-sm font-semibold text-gabon-green-dark mt-2">
                    {order.label} — {formatPrice(order.price)}
                  </p>
                </div>
              </label>
            );
          })}
          {requests.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-10">
              Aucune demande en attente d&apos;assignation.
            </p>
          )}
        </div>
      </Card>

      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-10 border-t border-gabon-green/10 bg-white/95 backdrop-blur-md px-4 py-3 md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none safe-x">
        <Card className="!p-4 md:sticky md:top-20">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {selected.size > 0
              ? `${selected.size} demande(s) sélectionnée(s)`
              : "Aucune sélection"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Agent livreur"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              options={[
                { value: "", label: "Choisir un agent..." },
                ...agents.map(({ agent, activeCount }) => {
                  const full = activeCount >= MAX_ASSIGNMENTS_PER_AGENT;
                  const label = agent.agent_code
                    ? `${agent.full_name} (${agent.agent_code}) — ${activeCount}/${MAX_ASSIGNMENTS_PER_AGENT}`
                    : `${agent.full_name} — ${activeCount}/${MAX_ASSIGNMENTS_PER_AGENT}`;
                  return {
                    value: agent.id,
                    label: full ? `${label} · Complet` : label,
                  };
                }),
              ]}
            />
            <div className="flex items-end">
              <Button
                onClick={handleAssign}
                loading={isPending}
                disabled={selected.size === 0 || !agentId}
                className="w-full"
                size="lg"
              >
                Assigner{selected.size > 0 ? ` (${selected.size})` : ""}
              </Button>
            </div>
          </div>
          {message && (
            <p
              className={`mt-3 text-sm font-medium ${
                message.includes("Erreur") ||
                message.includes("Sélectionnez") ||
                message.includes("Choisissez")
                  ? "text-red-600"
                  : "text-gabon-green"
              }`}
            >
              {message}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
