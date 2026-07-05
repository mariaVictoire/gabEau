"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPhoneOrder, createRequest, getPreviousRequestByPhone } from "@/actions/requests";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DISTRICTS } from "@/lib/constants";
import {
  calculateOrder,
  formatOrderLabel,
  formatPrice,
  getMaxQuantity,
  getQuantityUnit,
  PAYMENT_NOTICE,
  PRODUCT_CATALOG,
  PRODUCT_TYPES,
} from "@/lib/business-rules";
import type { CreateRequestInput, ProductType, Request } from "@/lib/types";
import { hasPublicSupabaseConfig, getSupabaseConfigMessage } from "@/lib/supabase/config";

const initialForm: CreateRequestInput = {
  full_name: "",
  phone: "",
  district: "",
  address_landmark: "",
  product_type: "cubic_meter",
  quantity: 1,
  comment: "",
};

const productOptions = PRODUCT_TYPES.map((type) => {
  const config = PRODUCT_CATALOG[type];
  return {
    value: type,
    label: `${config.label} (${config.shortLabel})`,
    price: `${formatPrice(config.unitPriceFcfa)} / ${config.quantityUnit}`,
    detail: config.detail,
  };
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
      {children}
    </h3>
  );
}

function QuantityStepper({
  value,
  min,
  max,
  onChange,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl font-bold text-gabon-green shadow-sm disabled:opacity-30 active:scale-95"
        aria-label="Diminuer"
      >
        −
      </button>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{unit}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl font-bold text-gabon-green shadow-sm disabled:opacity-30 active:scale-95"
        aria-label="Augmenter"
      >
        +
      </button>
    </div>
  );
}

export function RequestForm({ mode = "citizen" }: { mode?: "citizen" | "admin" }) {
  const router = useRouter();
  const [form, setForm] = useState<CreateRequestInput>(initialForm);
  const [error, setError] = useState("");
  const [phoneOrderSuccess, setPhoneOrderSuccess] = useState<Request | null>(null);
  const [isPending, startTransition] = useTransition();
  const isAdmin = mode === "admin";

  const maxQty = getMaxQuantity(form.product_type);
  const unit = getQuantityUnit(form.product_type, form.quantity);
  const order = calculateOrder(form.product_type, form.quantity);

  function updateField<K extends keyof CreateRequestInput>(
    key: K,
    value: CreateRequestInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectProductType(type: ProductType) {
    setForm((prev) => ({
      ...prev,
      product_type: type,
      quantity: 1,
    }));
  }

  async function handlePhoneBlur() {
    if (form.phone.length < 8 || !hasPublicSupabaseConfig()) return;
    try {
      const previous = await getPreviousRequestByPhone(form.phone);
      if (previous) {
        setForm((prev) => ({
          ...prev,
          ...previous,
          comment: "",
          quantity: previous.quantity ?? 1,
          product_type: previous.product_type ?? "cubic_meter",
        }));
      }
    } catch {
      // Ignore network errors (e.g. dev server restart)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isAdmin && !hasPublicSupabaseConfig()) {
      setError(getSupabaseConfigMessage());
      return;
    }
    startTransition(async () => {
      try {
        const result = isAdmin
          ? await createPhoneOrder(form)
          : await createRequest(form);
        if (result.success) {
          if (isAdmin) {
            setPhoneOrderSuccess(result.request);
            setForm(initialForm);
          } else {
            router.push(`/confirmation/${result.request.request_number}`);
          }
        } else {
          setError(result.error);
        }
      } catch {
        setError(
          "Connexion au serveur impossible. Rechargez la page (Ctrl+Shift+R) et réessayez."
        );
      }
    });
  }

  function handleNewPhoneOrder() {
    setPhoneOrderSuccess(null);
    setError("");
  }

  if (isAdmin && phoneOrderSuccess) {
    const agent = phoneOrderSuccess.assigned_agent;
    const assigned = phoneOrderSuccess.status === "assigned" && agent;

    return (
      <Card>
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gabon-green-light text-xl mb-2">
              ✓
            </div>
            <h2 className="text-lg font-bold text-slate-900">Commande enregistrée</h2>
            <p className="text-sm text-slate-500 mt-1">
              Communiquez le numéro de suivi au citoyen par téléphone.
            </p>
          </div>

          <div className="rounded-xl bg-gabon-green-light/40 border border-gabon-green/20 p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">N° de demande</p>
              <p className="font-mono text-xl font-bold text-gabon-green-dark">
                {phoneOrderSuccess.request_number}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-slate-400">Citoyen</p>
              <p className="font-semibold text-slate-900">{phoneOrderSuccess.full_name}</p>
              <p className="text-sm text-slate-600">{phoneOrderSuccess.phone}</p>
            </div>
            {assigned ? (
              <div className="rounded-lg bg-white/80 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400">Agent assigné</p>
                <p className="font-semibold text-slate-900">{agent.full_name}</p>
                {agent.agent_code && (
                  <p className="text-gabon-green-dark font-mono text-sm font-bold">{agent.agent_code}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                Pas encore assignée - tous les agents sont peut-être complets. Assignez manuellement
                dans Assignations.
              </p>
            )}
          </div>

          <Button type="button" size="lg" className="w-full" onClick={handleNewPhoneOrder}>
            Nouvelle commande (appel 18)
          </Button>
        </div>
      </Card>
    );
  }

  const missingConfig = !isAdmin && !hasPublicSupabaseConfig();

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {missingConfig && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            {getSupabaseConfigMessage()}
          </div>
        )}
        <div>
          <SectionTitle>{isAdmin ? "Informations citoyen (appel)" : "Vos coordonnées"}</SectionTitle>
          <div className="space-y-4">
            <Input
              label="Nom complet"
              required
              value={form.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
            />
            <Input
              label="Numéro de téléphone"
              type="tel"
              required
              placeholder="06 XX XX XX"
              hint={
                isAdmin
                  ? "Saisissez le numéro appelant - les infos précédentes seront pré-remplies si connues"
                  : undefined
              }
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              onBlur={handlePhoneBlur}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <SectionTitle>Localisation</SectionTitle>
          <div className="space-y-4">
            <Select
              label="Quartier"
              required
              value={form.district}
              onChange={(e) => updateField("district", e.target.value)}
              options={DISTRICTS.map((d) => ({ value: d, label: d }))}
            />
            <Input
              label="Adresse / Point de repère"
              required
              placeholder="Ex: derrière le marché, maison bleue..."
              value={form.address_landmark}
              onChange={(e) => updateField("address_landmark", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <SectionTitle>Votre commande</SectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {productOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectProductType(opt.value)}
                  className={`rounded-xl border-2 p-4 text-left transition-all min-h-[88px] active:scale-[0.98] ${
                    form.product_type === opt.value
                      ? "border-gabon-green bg-gabon-green-light shadow-sm"
                      : "border-slate-200 bg-white active:bg-slate-50"
                  }`}
                >
                  <p className="font-bold text-slate-900">{opt.label}</p>
                  <p className="text-sm font-semibold text-gabon-green-dark mt-1">{opt.price}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.detail}</p>
                </button>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Quantité</p>
              <QuantityStepper
                value={form.quantity}
                min={1}
                max={maxQty}
                unit={unit}
                onChange={(n) => updateField("quantity", n)}
              />
            </div>

            <div className="rounded-xl bg-gradient-to-r from-gabon-green-light to-gabon-blue-light border border-gabon-green/20 px-4 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Volume</span>
                <span className="font-bold text-slate-900 text-right">
                  {formatOrderLabel(form.product_type, form.quantity)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gabon-green/15 pt-2">
                <span className="text-slate-600 font-medium">Total</span>
                <span className="text-xl font-bold text-gabon-green-dark">
                  {formatPrice(order.price_fcfa)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{PAYMENT_NOTICE}</p>
          </div>
        </div>

        <Textarea
          label="Commentaire (optionnel)"
          placeholder="Informations complémentaires pour l'agent..."
          value={form.comment}
          onChange={(e) => updateField("comment", e.target.value)}
        />

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={isPending} className="w-full">
          {isAdmin ? "Enregistrer et assigner" : "Commander"}
        </Button>
      </form>
    </Card>
  );
}
