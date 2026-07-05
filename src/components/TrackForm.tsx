"use client";

import { useEffect, useState, useTransition } from "react";
import { trackRequest } from "@/actions/requests";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatPrice, getOrderDisplay } from "@/lib/business-rules";
import type { Request } from "@/lib/types";

export function TrackForm({
  initialNumber = "",
  initialPhone = "",
}: {
  initialNumber?: string;
  initialPhone?: string;
}) {
  const [requestNumber, setRequestNumber] = useState(initialNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [request, setRequest] = useState<Request | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function search(num: string, tel: string) {
    setError("");
    setRequest(null);
    startTransition(async () => {
      const result = await trackRequest(num, tel);
      if (result) setRequest(result);
      else setError("Aucune demande trouvée avec ces informations.");
    });
  }

  useEffect(() => {
    if (initialNumber && initialPhone) search(initialNumber, initialPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Suivre ma demande</h1>
        <p className="text-sm text-slate-500 mt-1">
          Entrez votre numéro de demande et votre téléphone
        </p>
      </div>

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); search(requestNumber, phone); }} className="space-y-4">
          <Input
            label="Numéro de demande"
            placeholder="EAU-154"
            required
            value={requestNumber}
            onChange={(e) => setRequestNumber(e.target.value)}
          />
          <Input
            label="Numéro de téléphone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button type="submit" loading={isPending} className="w-full" size="lg">
            Rechercher
          </Button>
        </form>
      </Card>

      {request && (() => {
        const order = getOrderDisplay(request);
        return (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono font-bold text-blue-700">{request.request_number}</span>
            <StatusBadge status={request.status} />
          </div>
          <dl className="space-y-0 divide-y divide-slate-100 text-sm">
            {[
              { label: "Date", value: formatDate(request.created_at) },
              { label: "Quartier", value: request.district },
              { label: "Commande", value: order.label },
              { label: "Montant", value: formatPrice(order.price) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3 gap-4">
                <dt className="text-slate-400 shrink-0">{label}</dt>
                <dd className="font-medium text-slate-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        );
      })()}
    </div>
  );
}
