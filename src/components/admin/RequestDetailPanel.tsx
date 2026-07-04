"use client";

import { useEffect, useState, useTransition } from "react";
import {
  updateRequestStatus,
  addRequestComment,
  toggleUrgent,
  getRequestEvents,
} from "@/actions/requests";
import { getCurrentUser } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice, getOrderDisplay } from "@/lib/business-rules";
import type { Request, RequestEvent } from "@/lib/types";

export function RequestDetailPanel({
  request,
  onUpdate,
  onClose,
}: {
  request: Request;
  onUpdate: (req: Request) => void;
  onClose?: () => void;
}) {
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState(request.status);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const evts = await getRequestEvents(request.id);
      setEvents(evts as RequestEvent[]);
    });
  }, [request.id]);

  function refreshEvents() {
    startTransition(async () => {
      const evts = await getRequestEvents(request.id);
      setEvents(evts as RequestEvent[]);
    });
  }

  function handleStatusUpdate() {
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      await updateRequestStatus(request.id, newStatus, user.id);
      const updated = { ...request, status: newStatus as Request["status"] };
      onUpdate(updated);
      refreshEvents();
    });
  }

  function handleAddComment() {
    if (!comment.trim()) return;
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      await addRequestComment(request.id, comment, user.id);
      setComment("");
      refreshEvents();
    });
  }

  function handleToggleUrgent() {
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      const newUrgent = !request.is_urgent;
      await toggleUrgent(request.id, newUrgent, user.id);
      onUpdate({ ...request, is_urgent: newUrgent });
    });
  }

  return (
    <div className="rounded-2xl border border-gabon-green/15 bg-white p-4 sm:p-5 shadow-sm">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mb-3 text-sm font-semibold text-gabon-green hover:underline min-h-[44px]"
        >
          ← Fermer le détail
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-gabon-green-dark">
            {request.request_number}
          </h2>
          <p className="text-sm text-slate-500">{formatDate(request.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
          {request.is_urgent && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 ring-1 ring-red-200">
              Urgente
            </span>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
        {[
          { label: "Nom", value: request.full_name },
          { label: "Téléphone", value: request.phone },
          { label: "Quartier", value: request.district },
          { label: "Adresse / Point de repère", value: request.address_landmark },
          { label: "Commande", value: getOrderDisplay(request).label },
          { label: "Montant", value: formatPrice(getOrderDisplay(request).price) },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-slate-400 text-xs font-medium">{label}</dt>
            <dd className="font-medium text-slate-800 mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <Select
          label="Modifier le statut"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as Request["status"])}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleStatusUpdate} loading={isPending} size="sm">
            Enregistrer le statut
          </Button>
          <Button
            variant={request.is_urgent ? "danger" : "outline"}
            onClick={handleToggleUrgent}
            size="sm"
          >
            {request.is_urgent ? "Retirer urgence" : "Marquer urgente"}
          </Button>
        </div>
        <Textarea
          label="Commentaire interne"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="secondary" onClick={handleAddComment} size="sm">
          Ajouter le commentaire
        </Button>
      </div>

      {events.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="font-semibold mb-2 text-slate-900">Historique</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
            {events.map((evt) => (
              <div key={evt.id} className="border-l-2 border-gabon-green/30 pl-3 py-1">
                <p className="text-slate-400 text-xs">{formatDate(evt.created_at)}</p>
                {evt.comment && <p className="text-slate-700">{evt.comment}</p>}
                {evt.new_status && (
                  <p className="text-xs text-gabon-green">
                    → {STATUS_LABELS[evt.new_status]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
