import type { ProductType, RequestPriority, RequestSituation, RequestStatus } from "./types";
import { PRODUCT_CATALOG } from "./business-rules";

export const DISTRICTS = [
  "Akanda",
  "Awendjé",
  "Baraka",
  "Batterie IV",
  "Belle Vue",
  "Camp des Boys",
  "Charbonnages",
  "Cocotiers",
  "Derrière la Prison",
  "Glass",
  "Lalala",
  "Louis",
  "Mont-Bouët",
  "Nombakélé",
  "Nzeng-Ayong",
  "Oloumi",
  "PK5",
  "PK8",
  "Quartier Louis",
  "Sibang",
  "Trois Quartiers",
  "Autre",
] as const;

export const STATUS_LABELS: Record<RequestStatus, string> = {
  received: "Reçue",
  in_review: "En examen",
  assigned: "Assignée",
  in_progress: "En cours",
  delivered: "Livrée",
  cancelled: "Annulée",
  failed_delivery: "Échec livraison",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  received: "bg-blue-50 text-blue-700 ring-blue-200",
  in_review: "bg-amber-50 text-amber-700 ring-amber-200",
  assigned: "bg-violet-50 text-violet-700 ring-violet-200",
  in_progress: "bg-orange-50 text-orange-700 ring-orange-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-slate-50 text-slate-600 ring-slate-200",
  failed_delivery: "bg-red-50 text-red-700 ring-red-200",
};

export const SITUATION_LABELS: Record<RequestSituation, string> = {
  no_water: "Plus d'eau",
  low_stock: "Stock faible",
  preventive: "Besoin préventif",
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};

export const PRIORITY_COLORS: Record<RequestPriority, string> = {
  low: "bg-slate-50 text-slate-600 ring-slate-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-red-50 text-red-700 ring-red-200",
};

export const ROLE_LABELS = {
  operator: "Opérateur",
  coordinator: "Coordinateur",
  agent: "Agent de livraison",
  admin: "Administrateur",
} as const;

export const PRODUCT_LABELS: Record<ProductType, string> = {
  cubic_meter: PRODUCT_CATALOG.cubic_meter.label,
  container_500l: PRODUCT_CATALOG.container_500l.label,
  container_200l: PRODUCT_CATALOG.container_200l.label,
  container_100l: PRODUCT_CATALOG.container_100l.label,
};
