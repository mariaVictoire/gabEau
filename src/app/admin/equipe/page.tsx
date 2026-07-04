"use client";

import { useEffect, useState, useTransition } from "react";
import { createAgent, deleteAgent, getStaffAgents } from "@/actions/staff";
import {
  buildAgentCredentialsMessage,
  buildSmsLink,
  buildWhatsAppLink,
  formatPhoneForMessaging,
} from "@/lib/agent-credentials-message";
import { extractAgentPrefix, formatAgentCode } from "@/lib/agent-auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { User } from "@/lib/types";

type AgentCredentials = {
  full_name: string;
  agent_code: string;
  pin: string;
  phone: string | null;
};

function AgentList({
  agents,
  isPending,
  onDelete,
}: {
  agents: User[];
  isPending: boolean;
  onDelete: (agent: User) => void;
}) {
  if (agents.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-10">
        Aucun agent enregistré pour le moment.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {agents.map((a) => (
        <li
          key={a.id}
          className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
        >
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{a.full_name}</p>
            {a.agent_code && (
              <p className="text-gabon-green-dark font-mono text-sm font-bold mt-1">
                {a.agent_code}
              </p>
            )}
            {a.phone && <p className="text-slate-500 text-xs mt-1">{a.phone}</p>}
          </div>
          <button
            type="button"
            onClick={() => onDelete(a)}
            disabled={isPending}
            className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 min-h-[44px] px-2"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function EquipePage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [recap, setRecap] = useState<AgentCredentials | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [agentForm, setAgentForm] = useState({
    full_name: "",
    phone: "",
  });

  const codePreview = agentForm.full_name.trim()
    ? formatAgentCode(extractAgentPrefix(agentForm.full_name), 1)
    : null;

  const loginUrl =
    typeof window !== "undefined" ? `${window.location.origin}/agent/login` : "/agent/login";

  const recapMessage = recap
    ? buildAgentCredentialsMessage({
        full_name: recap.full_name,
        agent_code: recap.agent_code,
        pin: recap.pin,
        loginUrl,
      })
    : "";

  const smsLink = recap?.phone ? buildSmsLink(recap.phone, recapMessage) : null;
  const whatsAppLink = recap?.phone ? buildWhatsAppLink(recap.phone, recapMessage) : null;
  const hasValidPhone = recap?.phone ? !!formatPhoneForMessaging(recap.phone) : false;

  function loadData() {
    startTransition(async () => {
      const agts = await getStaffAgents();
      setAgents(agts);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleCreateAgent(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCopied(false);
    startTransition(async () => {
      const result = await createAgent(agentForm);
      if (result.success && result.credentials) {
        setRecap(result.credentials);
        setAgentForm({ full_name: "", phone: "" });
        setShowAddForm(false);
        loadData();
      } else {
        setError(result.error || "Erreur.");
      }
    });
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(recapMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier le message.");
    }
  }

  function handleDeleteAgent(agent: User) {
    const label = agent.agent_code
      ? `${agent.full_name} (${agent.agent_code})`
      : agent.full_name;
    if (
      !confirm(
        `Supprimer l'agent « ${label} » ?\n\nSes livraisons en cours seront désassignées.`
      )
    ) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await deleteAgent(agent.id);
      if (result.success) {
        loadData();
      } else {
        setError(result.error || "Suppression impossible.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Agents livreurs</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {recap && (
        <div className="rounded-2xl border-2 border-gabon-green bg-gabon-green-light/30 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gabon-green-dark">Agent créé</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Transmettez ces identifiants à {recap.full_name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRecap(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-semibold min-h-[44px] px-2"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/90 px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Code agent</p>
              <p className="font-mono font-bold text-gabon-green-dark">{recap.agent_code}</p>
            </div>
            <div className="rounded-xl bg-white/90 px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Code PIN</p>
              <p className="font-mono font-bold text-gabon-blue">{recap.pin}</p>
            </div>
            <div className="rounded-xl bg-white/90 px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Nom</p>
              <p className="font-semibold text-slate-900 text-sm truncate">{recap.full_name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasValidPhone && whatsAppLink && (
              <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
                <Button type="button" size="sm" variant="success">
                  WhatsApp
                </Button>
              </a>
            )}
            {hasValidPhone && smsLink && (
              <a href={smsLink}>
                <Button type="button" size="sm" variant="primary">
                  SMS
                </Button>
              </a>
            )}
            <Button type="button" size="sm" variant="outline" onClick={handleCopyMessage}>
              {copied ? "Copié !" : "Copier"}
            </Button>
          </div>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-slate-900">Liste des agents</h2>
          <Button
            type="button"
            size="sm"
            variant={showAddForm ? "secondary" : "primary"}
            onClick={() => {
              setShowAddForm((v) => !v);
              setError("");
            }}
          >
            {showAddForm ? "Annuler" : "+ Ajouter"}
          </Button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleCreateAgent}
            className="space-y-3 mb-6 pb-6 border-b border-slate-100 max-w-md"
          >
            <Input
              label="Nom complet"
              required
              placeholder="Ex: ACD Maria"
              value={agentForm.full_name}
              onChange={(e) => setAgentForm({ ...agentForm, full_name: e.target.value })}
            />
            {codePreview && (
              <p className="text-xs text-slate-500 -mt-1">
                Code estimé :{" "}
                <span className="font-mono font-semibold text-gabon-green-dark">{codePreview}</span>
              </p>
            )}
            <Input
              label="Téléphone (pour envoyer les identifiants)"
              type="tel"
              placeholder="Ex: 06 12 34 56 78"
              value={agentForm.phone}
              onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
            />
            <Button type="submit" loading={isPending} className="w-full sm:w-auto">
              Ajouter l&apos;agent
            </Button>
          </form>
        )}

        <AgentList agents={agents} isPending={isPending} onDelete={handleDeleteAgent} />
      </Card>
    </div>
  );
}
