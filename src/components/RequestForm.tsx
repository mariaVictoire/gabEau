"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createRequest, getPreviousRequestByPhone } from "@/actions/requests";
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
  MAX_CONTAINERS,
  MAX_CUBIC_METERS,
  PRICE_PER_CONTAINER_200L,
  PRICE_PER_CUBIC_METER,
} from "@/lib/business-rules";
import type { CreateRequestInput, ProductType } from "@/lib/types";
import { hasPublicSupabaseConfig, SUPABASE_CONFIG_MESSAGE } from "@/lib/supabase/config";

const initialForm: CreateRequestInput = {
  full_name: "",
  phone: "",
  district: "",
  address_landmark: "",
  product_type: "cubic_meter",
  quantity: 1,
  comment: "",
};

const productOptions: {
  value: ProductType;
  label: string;
  price: string;
  detail: string;
}[] = [
  {
    value: "cubic_meter",
    label: "Mètre cube",
    price: `${PRICE_PER_CUBIC_METER.toLocaleString("fr-FR")} FCFA / m³`,
    detail: "1 m³ = 1 000 litres",
  },
  {
    value: "container_200l",
    label: "Bidon 200 L",
    price: `${PRICE_PER_CONTAINER_200L.toLocaleString("fr-FR")} FCFA / bidon`,
    detail: "Format prêt à l'emploi",
  },
];

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

export function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateRequestInput>(initialForm);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const maxQty =
    form.product_type === "cubic_meter" ? MAX_CUBIC_METERS : MAX_CONTAINERS;
  const unit =
    form.product_type === "cubic_meter" ? "mètre(s) cube(s)" : "bidon(s)";
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
    if (!hasPublicSupabaseConfig()) {
      setError(SUPABASE_CONFIG_MESSAGE);
      return;
    }
    startTransition(async () => {
      try {
        const result = await createRequest(form);
        if (result.success) {
          router.push(`/confirmation/${result.request.request_number}`);
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

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <SectionTitle>Vos coordonnées</SectionTitle>
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
              hint="Vos infos seront pré-remplies si vous avez déjà fait une demande"
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <span className="font-bold text-slate-900">
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
          Commander
        </Button>
      </form>
    </Card>
  );
}
