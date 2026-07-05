import type { ProductType, RequestPriority } from "./types";

export interface ProductConfig {
  label: string;
  shortLabel: string;
  volumeLiters: number;
  unitPriceFcfa: number;
  maxQuantity: number;
  quantityUnit: string;
  quantityUnitPlural: string;
  detail: string;
}

/** Tarifs officiels - juillet 2026 (Libreville) */
export const PRODUCT_CATALOG: Record<ProductType, ProductConfig> = {
  cubic_meter: {
    label: "Cubitainer",
    shortLabel: "1 m³",
    volumeLiters: 1000,
    unitPriceFcfa: 4000,
    maxQuantity: 5,
    quantityUnit: "cubitainer",
    quantityUnitPlural: "cubitainers",
    detail: "1 m³ = 1 000 litres",
  },
  container_500l: {
    label: "Grand fût",
    shortLabel: "500 L",
    volumeLiters: 500,
    unitPriceFcfa: 2000,
    maxQuantity: 10,
    quantityUnit: "grand fût",
    quantityUnitPlural: "grands fûts",
    detail: "500 litres",
  },
  container_200l: {
    label: "Fût",
    shortLabel: "200 L",
    volumeLiters: 200,
    unitPriceFcfa: 800,
    maxQuantity: 10,
    quantityUnit: "fût",
    quantityUnitPlural: "fûts",
    detail: "200 litres",
  },
  container_100l: {
    label: "Petite livraison",
    shortLabel: "100 L",
    volumeLiters: 100,
    unitPriceFcfa: 400,
    maxQuantity: 10,
    quantityUnit: "livraison",
    quantityUnitPlural: "livraisons",
    detail: "100 litres",
  },
};

export const PRODUCT_TYPES = Object.keys(PRODUCT_CATALOG) as ProductType[];

export const PAYMENT_NOTICE =
  "Paiement en espèces à la livraison, auprès de l'agent des forces de l'ordre.";

/** @deprecated Utiliser PRODUCT_CATALOG.cubic_meter.unitPriceFcfa */
export const PRICE_PER_CUBIC_METER = PRODUCT_CATALOG.cubic_meter.unitPriceFcfa;
/** @deprecated Utiliser PRODUCT_CATALOG.container_200l.unitPriceFcfa */
export const PRICE_PER_CONTAINER_200L = PRODUCT_CATALOG.container_200l.unitPriceFcfa;
/** @deprecated */
export const LITERS_PER_CUBIC_METER = PRODUCT_CATALOG.cubic_meter.volumeLiters;
/** @deprecated */
export const LITERS_PER_CONTAINER = PRODUCT_CATALOG.container_200l.volumeLiters;
/** @deprecated Utiliser getMaxQuantity */
export const MAX_CUBIC_METERS = PRODUCT_CATALOG.cubic_meter.maxQuantity;
/** @deprecated Utiliser getMaxQuantity */
export const MAX_CONTAINERS = PRODUCT_CATALOG.container_200l.maxQuantity;

export function getProductConfig(productType: ProductType): ProductConfig {
  return PRODUCT_CATALOG[productType] ?? PRODUCT_CATALOG.cubic_meter;
}

export function getMaxQuantity(productType: ProductType): number {
  return getProductConfig(productType).maxQuantity;
}

export function getQuantityUnit(productType: ProductType, quantity: number): string {
  const config = getProductConfig(productType);
  return quantity > 1 ? config.quantityUnitPlural : config.quantityUnit;
}

export function calculateOrder(productType: ProductType, quantity: number) {
  const config = getProductConfig(productType);
  return {
    estimated_volume_liters: quantity * config.volumeLiters,
    price_fcfa: quantity * config.unitPriceFcfa,
  };
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

export function formatOrderLabel(productType: ProductType, quantity: number): string {
  const config = getProductConfig(productType);
  const unit = getQuantityUnit(productType, quantity);
  const totalLiters = quantity * config.volumeLiters;
  return `${quantity} ${unit} (${totalLiters.toLocaleString("fr-FR")} L)`;
}

export function getOrderDisplay(request: {
  product_type?: ProductType;
  quantity?: number;
  price_fcfa?: number;
  estimated_volume_liters: number;
}) {
  const productType = request.product_type ?? "cubic_meter";
  const quantity = request.quantity ?? 1;
  const price =
    request.price_fcfa ?? calculateOrder(productType, quantity).price_fcfa;
  return {
    label: formatOrderLabel(productType, quantity),
    price,
    volumeLiters: request.estimated_volume_liters,
  };
}

export function calculatePriority(): RequestPriority {
  return "medium";
}

export function formatPhone(phone: string): string {
  return phone.replace(/\s/g, "").replace(/^\+241/, "0");
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
