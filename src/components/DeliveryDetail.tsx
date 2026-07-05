"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  startDelivery,
  completeDelivery,
  failDelivery,
  uploadDeliveryPhoto,
} from "@/actions/requests";
import { getCurrentUser } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice, getOrderDisplay } from "@/lib/business-rules";
import type { Request } from "@/lib/types";

export function DeliveryDetail({ delivery }: { delivery: Request }) {
  const router = useRouter();
  const [showComplete, setShowComplete] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [personMet, setPersonMet] = useState("");
  const [comment, setComment] = useState("");
  const [failComment, setFailComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      await startDelivery(delivery.id, user.id);
      setMessage("Livraison démarrée.");
      router.refresh();
    });
  }

  function handleComplete() {
    if (!personMet.trim()) {
      setMessage("Indiquez le nom de la personne rencontrée.");
      return;
    }
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      let photoUrl: string | undefined;
      if (photo) {
        photoUrl = (await uploadDeliveryPhoto(photo, delivery.id)) || undefined;
      }
      await completeDelivery(delivery.id, user.id, personMet, comment, photoUrl);
      router.push("/agent/deliveries");
      router.refresh();
    });
  }

  function handleFail() {
    startTransition(async () => {
      const user = await getCurrentUser();
      if (!user) return;
      await failDelivery(delivery.id, user.id, failComment);
      router.push("/agent/deliveries");
      router.refresh();
    });
  }

  const isActive = ["assigned", "in_progress"].includes(delivery.status);
  const showStickyActions =
    isActive && !showComplete && !showFail;
  const order = getOrderDisplay(delivery);

  return (
    <div className={`space-y-4 ${showStickyActions ? "pb-28" : ""}`}>
      <Card>
        <div className="flex justify-between items-start gap-2 mb-4">
          <h1 className="text-lg font-bold font-mono text-blue-700">
            {delivery.request_number}
          </h1>
          <StatusBadge status={delivery.status} />
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-slate-400 text-xs font-medium">Citoyen</dt>
            <dd className="font-semibold text-xl text-slate-900 mt-0.5">
              {delivery.full_name}
            </dd>
          </div>

          <a
            href={`tel:${delivery.phone}`}
            className="flex items-center justify-between rounded-xl bg-blue-600 text-white px-4 py-4 min-h-[56px] active:bg-blue-700 transition-colors"
          >
            <span className="text-sm font-medium opacity-80">Appeler</span>
            <span className="text-lg font-bold">{delivery.phone}</span>
          </a>

          <div>
            <dt className="text-slate-400 text-xs font-medium">Quartier</dt>
            <dd className="font-semibold text-slate-800 mt-0.5">{delivery.district}</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs font-medium">Adresse / Point de repère</dt>
            <dd className="text-slate-800 mt-0.5 leading-relaxed">{delivery.address_landmark}</dd>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Commande</p>
            <p className="font-bold text-slate-900 mt-0.5">{order.label}</p>
            <p className="text-lg font-bold text-blue-700 mt-1">{formatPrice(order.price)}</p>
          </div>
          {delivery.comment && (
            <div>
              <dt className="text-slate-400 text-xs font-medium">Commentaire</dt>
              <dd className="mt-0.5 text-slate-700">{delivery.comment}</dd>
            </div>
          )}
        </dl>
      </Card>

      {message && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {showComplete && (
        <Card>
          <h2 className="font-bold mb-4 text-slate-900">Confirmation de livraison</h2>
          <div className="space-y-4">
            <Input
              label="Nom de la personne rencontrée"
              required
              value={personMet}
              onChange={(e) => setPersonMet(e.target.value)}
            />
            <Textarea
              label="Commentaire (optionnel)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Photo de preuve (optionnel)
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="w-full text-base file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="success" size="lg" onClick={handleComplete} loading={isPending}>
                Confirmer la livraison
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setShowComplete(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showFail && (
        <Card>
          <h2 className="font-bold mb-4 text-slate-900">Échec de livraison</h2>
          <div className="space-y-4">
            <Textarea
              label="Raison (optionnel)"
              value={failComment}
              onChange={(e) => setFailComment(e.target.value)}
              placeholder="Ex: adresse introuvable, personne absente..."
            />
            <div className="flex flex-col gap-3">
              <Button variant="danger" size="lg" onClick={handleFail} loading={isPending}>
                Confirmer l&apos;échec
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setShowFail(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sticky action bar - mobile-first for agents */}
      {showStickyActions && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 safe-bottom safe-x shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-lg space-y-2">
            {delivery.status === "assigned" && (
              <Button size="lg" className="w-full" onClick={handleStart} loading={isPending}>
                🚚 Démarrer la livraison
              </Button>
            )}
            {delivery.status === "in_progress" && (
              <>
                <Button
                  size="lg"
                  variant="success"
                  className="w-full"
                  onClick={() => setShowComplete(true)}
                >
                  ✓ Marquer comme livrée
                </Button>
                <Button
                  size="lg"
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowFail(true)}
                >
                  ✕ Échec de livraison
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
