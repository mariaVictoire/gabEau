import type { RequestStatus } from "@/lib/types";

export const GABON = {
  green: "#008751",
  greenDark: "#006b40",
  greenLight: "#e6f5ef",
  yellow: "#fcd116",
  yellowLight: "#fef9e7",
  blue: "#006bb5",
  blueDark: "#005a96",
  blueLight: "#e8f2fa",
} as const;

export const GABON_RGB = {
  green: [0, 135, 81] as const,
  yellow: [252, 209, 22] as const,
  blue: [0, 107, 181] as const,
  slate100: [241, 245, 249] as const,
  slate200: [226, 232, 240] as const,
  slate400: [148, 163, 184] as const,
  slate600: [71, 85, 105] as const,
  slate900: [15, 23, 42] as const,
  white: [255, 255, 255] as const,
};

export const STATUS_CHART_COLORS: Record<RequestStatus, string> = {
  received: "#3b82f6",
  in_review: "#f59e0b",
  assigned: "#8b5cf6",
  in_progress: "#f97316",
  delivered: "#008751",
  cancelled: "#94a3b8",
  failed_delivery: "#ef4444",
};

export const STATUS_CHART_RGB: Record<RequestStatus, readonly [number, number, number]> = {
  received: [59, 130, 246],
  in_review: [245, 158, 11],
  assigned: [139, 92, 246],
  in_progress: [249, 115, 22],
  delivered: [0, 135, 81],
  cancelled: [148, 163, 184],
  failed_delivery: [239, 68, 68],
};

export const KPI_ACCENTS = [GABON.green, GABON.yellow, GABON.blue, GABON.greenDark] as const;
