import type { ProductType, RequestPriority } from "./types";

export const PRICE_PER_CUBIC_METER = 3000;
export const PRICE_PER_CONTAINER_200L = 600;
export const LITERS_PER_CUBIC_METER = 1000;
export const LITERS_PER_CONTAINER = 200;

export const MAX_CUBIC_METERS = 5;
export const MAX_CONTAINERS = 10;

export function calculateOrder(productType: ProductType, quantity: number) {
  if (productType === "cubic_meter") {
    return {
      estimated_volume_liters: quantity * LITERS_PER_CUBIC_METER,
      price_fcfa: quantity * PRICE_PER_CUBIC_METER,
    };
  }
  return {
    estimated_volume_liters: quantity * LITERS_PER_CONTAINER,
    price_fcfa: quantity * PRICE_PER_CONTAINER_200L,
  };
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

export function formatOrderLabel(productType: ProductType, quantity: number): string {
  if (productType === "cubic_meter") {
    return `${quantity} m³ (${(quantity * LITERS_PER_CUBIC_METER).toLocaleString("fr-FR")} L)`;
  }
  return `${quantity} bidon${quantity > 1 ? "s" : ""} × 200 L (${(quantity * LITERS_PER_CONTAINER).toLocaleString("fr-FR")} L)`;
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
