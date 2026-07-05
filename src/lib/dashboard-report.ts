import { PRODUCT_CATALOG } from "@/lib/business-rules";
import { PRODUCT_LABELS, STATUS_LABELS } from "@/lib/constants";
import type {
  DashboardReport,
  DashboardReportPeriod,
  ProductType,
  RequestStatus,
} from "@/lib/types";

type RequestRow = {
  status: RequestStatus;
  district: string;
  is_urgent: boolean;
  price_fcfa: number | null;
  estimated_volume_liters: number;
  product_type: ProductType | null;
  quantity: number | null;
  created_at: string;
};

export const PERIOD_OPTIONS: {
  value: DashboardReportPeriod;
  label: string;
}[] = [
  { value: "day", label: "Journalier" },
  { value: "week", label: "Hebdomadaire" },
  { value: "month", label: "Mensuel" },
];

export function getPeriodRange(period: DashboardReportPeriod): {
  from: Date;
  to: Date;
  periodLabel: string;
} {
  const to = new Date();
  const from = new Date();

  if (period === "day") {
    from.setHours(0, 0, 0, 0);
    return { from, to, periodLabel: "Rapport journalier" };
  }

  if (period === "week") {
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from, to, periodLabel: "Rapport hebdomadaire" };
  }

  from.setDate(1);
  from.setHours(0, 0, 0, 0);
  return { from, to, periodLabel: "Rapport mensuel" };
}

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}h`;
}

function buildTimeline(
  period: DashboardReportPeriod,
  rows: RequestRow[],
  from: Date,
  to: Date
): DashboardReport["byTimeline"] {
  if (period === "day") {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: formatHourLabel(hour),
      count: 0,
      delivered: 0,
    }));

    for (const row of rows) {
      const hour = new Date(row.created_at).getHours();
      buckets[hour].count += 1;
      if (row.status === "delivered") buckets[hour].delivered += 1;
    }

    return buckets;
  }

  const buckets = new Map<string, { label: string; count: number; delivered: number }>();
  const cursor = new Date(from);

  while (cursor <= to) {
    const key = formatDayKey(cursor);
    buckets.set(key, { label: formatDayLabel(cursor), count: 0, delivered: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const row of rows) {
    const key = formatDayKey(new Date(row.created_at));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.count += 1;
    if (row.status === "delivered") bucket.delivered += 1;
  }

  return Array.from(buckets.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
}

export function buildDashboardReport(
  period: DashboardReportPeriod,
  rows: RequestRow[]
): DashboardReport {
  const { from, to, periodLabel } = getPeriodRange(period);

  const pending = rows.filter((r) => ["received", "in_review"].includes(r.status)).length;
  const assigned = rows.filter((r) => ["assigned", "in_progress"].includes(r.status)).length;
  const delivered = rows.filter((r) => r.status === "delivered").length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;
  const failed = rows.filter((r) => r.status === "failed_delivery").length;
  const urgent = rows.filter((r) => r.is_urgent).length;

  const revenueFcfa = rows.reduce((sum, r) => sum + (r.price_fcfa ?? 0), 0);
  const volumeLiters = rows.reduce((sum, r) => sum + r.estimated_volume_liters, 0);
  const deliveryRate = rows.length > 0 ? Math.round((delivered / rows.length) * 100) : 0;
  const avgOrderValue = rows.length > 0 ? Math.round(revenueFcfa / rows.length) : 0;

  const districtMap = new Map<string, number>();
  for (const row of rows) {
    districtMap.set(row.district, (districtMap.get(row.district) || 0) + 1);
  }
  const byDistrict = Array.from(districtMap.entries())
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  const statusOrder: RequestStatus[] = [
    "received",
    "in_review",
    "assigned",
    "in_progress",
    "delivered",
    "cancelled",
    "failed_delivery",
  ];
  const byStatus = statusOrder
    .map((status) => ({
      status,
      count: rows.filter((r) => r.status === status).length,
    }))
    .filter((item) => item.count > 0);

  const productMap = new Map<ProductType, { count: number; revenue: number }>();
  for (const row of rows) {
    const productType = (row.product_type ?? "cubic_meter") as ProductType;
    const current = productMap.get(productType) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += row.price_fcfa ?? 0;
    productMap.set(productType, current);
  }
  const byProduct = Array.from(productMap.entries())
    .map(([productType, data]) => ({
      productType,
      label: PRODUCT_LABELS[productType] ?? PRODUCT_CATALOG[productType]?.label ?? productType,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    period,
    periodLabel,
    fromDate: from.toISOString(),
    toDate: to.toISOString(),
    total: rows.length,
    pending,
    assigned,
    delivered,
    cancelled,
    failed,
    urgent,
    revenueFcfa,
    volumeLiters,
    deliveryRate,
    avgOrderValue,
    byDistrict,
    byStatus,
    byTimeline: buildTimeline(period, rows, from, to),
    byProduct,
  };
}

export function formatReportDateRange(report: DashboardReport): string {
  const from = new Date(report.fromDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: report.period === "day" ? "2-digit" : undefined,
    minute: report.period === "day" ? "2-digit" : undefined,
  });
  const to = new Date(report.toDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: report.period === "day" ? "2-digit" : undefined,
    minute: report.period === "day" ? "2-digit" : undefined,
  });
  return report.period === "day" ? `Du ${from} au ${to}` : `Du ${from} au ${to}`;
}

export function statusLabel(status: RequestStatus): string {
  return STATUS_LABELS[status];
}
