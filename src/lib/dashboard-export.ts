import { formatPrice } from "@/lib/business-rules";
import {
  GABON_RGB,
  KPI_ACCENTS,
  STATUS_CHART_RGB,
} from "@/lib/dashboard-report-brand";
import { formatReportDateRange, statusLabel } from "@/lib/dashboard-report";
import type { DashboardReport } from "@/lib/types";
import type { RequestStatus } from "@/lib/types";

export const EXPORT_DOCUMENT_WIDTH = 900;

function periodSlug(period: DashboardReport["period"]): string {
  if (period === "day") return "journalier";
  if (period === "week") return "hebdomadaire";
  return "mensuel";
}

type JsPDFInstance = {
  setFillColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setTextColor: (r: number, g?: number, b?: number) => void;
  setFontSize: (size: number) => void;
  setFont: (font: string, style?: string) => void;
  text: (text: string, x: number, y: number) => void;
  rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string) => void;
  circle: (x: number, y: number, r: number, style?: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  addPage: () => void;
  save: (filename: string) => void;
};

type JsPDFWithAutoTable = JsPDFInstance & {
  lastAutoTable: { finalY: number };
};

function rgb(hex: readonly [number, number, number]) {
  return hex;
}

function drawTricolorBar(doc: JsPDFInstance, x: number, y: number, w: number, h: number) {
  const third = w / 3;
  doc.setFillColor(...rgb(GABON_RGB.green));
  doc.rect(x, y, third, h, "F");
  doc.setFillColor(...rgb(GABON_RGB.yellow));
  doc.rect(x + third, y, third, h, "F");
  doc.setFillColor(...rgb(GABON_RGB.blue));
  doc.rect(x + third * 2, y, third, h, "F");
}

function drawGabonFlag(doc: JsPDFInstance, x: number, y: number, w: number, h: number) {
  const band = h / 3;
  doc.setFillColor(...rgb(GABON_RGB.green));
  doc.rect(x, y, w, band, "F");
  doc.setFillColor(...rgb(GABON_RGB.yellow));
  doc.rect(x, y + band, w, band, "F");
  doc.setFillColor(...rgb(GABON_RGB.blue));
  doc.rect(x, y + band * 2, w, band, "F");
  doc.setDrawColor(...rgb(GABON_RGB.slate200));
  doc.rect(x, y, w, h, "S");
}

function drawHeaderBanner(doc: JsPDFInstance, margin: number, pageW: number) {
  const bannerH = 32;
  const contentW = pageW - margin * 2;

  doc.setFillColor(...rgb(GABON_RGB.green));
  doc.rect(margin, 10, contentW * 0.55, bannerH, "F");
  doc.setFillColor(...rgb(GABON_RGB.blue));
  doc.rect(margin + contentW * 0.45, 10, contentW * 0.55, bannerH, "F");

  drawGabonFlag(doc, pageW - margin - 14, 14, 14, 10);

  doc.setFillColor(...rgb(GABON_RGB.white));
  doc.roundedRect(margin + 4, 16, 10, 10, 2, 2, "F");
  doc.setFillColor(200, 230, 220);
  doc.circle(margin + 9, 19, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Gab'Eau", margin + 18, 22);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(252, 209, 22);
  doc.text("Libreville, Gabon", margin + 18, 27);

  return 10 + bannerH + 6;
}

function drawHorizontalBar(
  doc: JsPDFInstance,
  x: number,
  y: number,
  w: number,
  h: number,
  value: number,
  max: number,
  color: readonly [number, number, number]
) {
  doc.setFillColor(...rgb(GABON_RGB.slate100));
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "F");
  const barW = max > 0 ? Math.max(2, (value / max) * w) : 0;
  if (barW > 0) {
    doc.setFillColor(...rgb(color));
    doc.roundedRect(x, y, barW, h, 1.5, 1.5, "F");
  }
}

function drawVerticalBars(
  doc: JsPDFInstance,
  items: { label: string; count: number; delivered: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  max: number
) {
  if (items.length === 0) return;
  const gap = 2;
  const barW = (w - gap * (items.length - 1)) / items.length;
  const chartBottom = y + h;

  items.forEach((item, i) => {
    const barX = x + i * (barW + gap);
    const barH = max > 0 ? Math.max(3, (item.count / max) * (h - 8)) : 3;
    const deliveredH =
      max > 0 && item.count > 0 ? Math.max(2, (item.delivered / max) * (h - 8)) : 0;

    doc.setFillColor(230, 245, 239);
    doc.rect(barX, chartBottom - barH, barW, barH, "F");
    if (deliveredH > 0) {
      doc.setFillColor(...rgb(GABON_RGB.green));
      doc.rect(barX, chartBottom - deliveredH, barW, deliveredH, "F");
    }

    doc.setFontSize(6);
    doc.setTextColor(...rgb(GABON_RGB.slate900));
    doc.setFont("helvetica", "bold");
    doc.text(String(item.count), barX + barW / 2 - 1.5, chartBottom - barH - 2);

    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...rgb(GABON_RGB.slate400));
    const label = item.label.length > 6 ? item.label.slice(0, 5) + "." : item.label;
    doc.text(label, barX, chartBottom + 4);
  });
}

function drawStatusLegend(
  doc: JsPDFInstance,
  items: { status: RequestStatus; count: number }[],
  x: number,
  y: number
) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (total === 0) return y;

  const radius = 12;
  const cx = x + radius;
  const cy = y + radius;

  doc.setFillColor(...rgb(GABON_RGB.green));
  doc.circle(cx, cy, radius, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, radius * 0.58, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...rgb(GABON_RGB.slate900));
  doc.text(String(total), cx - (total >= 10 ? 4 : 2), cy + 1);
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...rgb(GABON_RGB.slate400));
  doc.text("total", cx - 3.5, cy + 5);

  let ly = y;
  const lx = x + radius * 2 + 8;
  doc.setFontSize(7);
  for (const item of items) {
    const color = STATUS_CHART_RGB[item.status];
    doc.setFillColor(...rgb(color));
    doc.roundedRect(lx, ly, 3, 3, 0.5, 0.5, "F");
    doc.setTextColor(...rgb(GABON_RGB.slate600));
    doc.setFont("helvetica", "normal");
    doc.text(`${statusLabel(item.status)} (${item.count})`, lx + 5, ly + 2.5);
    ly += 5;
  }

  return Math.max(y + radius * 2 + 4, ly + 2);
}

function ensureSpace(doc: JsPDFWithAutoTable, y: number, needed: number, margin: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - margin) {
    doc.addPage();
    drawTricolorBar(doc, margin, 8, doc.internal.pageSize.getWidth() - margin * 2, 1.5);
    return 16;
  }
  return y;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ] as const;
}

export async function exportDashboardToPDF(report: DashboardReport) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as unknown as JsPDFWithAutoTable;
  const margin = 14;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - margin * 2;

  drawTricolorBar(doc, margin, 6, contentW, 2);
  let y = drawHeaderBanner(doc, margin, pageW);

  doc.setTextColor(...rgb(GABON_RGB.slate900));
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(report.periodLabel, margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...rgb(GABON_RGB.slate600));
  doc.text(formatReportDateRange(report), margin, y);
  y += 8;

  const kpis: { label: string; value: string; accent: string }[] = [
    { label: "Demandes", value: String(report.total), accent: KPI_ACCENTS[0] },
    { label: "Livrées", value: `${report.delivered} (${report.deliveryRate} %)`, accent: KPI_ACCENTS[1] },
    { label: "À traiter", value: String(report.pending), accent: KPI_ACCENTS[2] },
    { label: "En livraison", value: String(report.assigned), accent: KPI_ACCENTS[3] },
    { label: "Chiffre d'affaires", value: formatPrice(report.revenueFcfa), accent: KPI_ACCENTS[0] },
    { label: "Volume", value: `${report.volumeLiters.toLocaleString("fr-FR")} L`, accent: KPI_ACCENTS[1] },
    { label: "Panier moyen", value: formatPrice(report.avgOrderValue), accent: KPI_ACCENTS[2] },
    { label: "Urgentes", value: String(report.urgent), accent: KPI_ACCENTS[3] },
  ];

  const kpiW = (contentW - 9) / 4;
  const kpiH = 16;
  for (let i = 0; i < kpis.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const kx = margin + col * (kpiW + 3);
    const ky = y + row * (kpiH + 3);

    doc.setDrawColor(...rgb(GABON_RGB.slate200));
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(kx, ky, kpiW, kpiH, 2, 2, "FD");

    const accent = hexToRgb(kpis[i].accent);
    doc.setFillColor(...rgb(accent));
    doc.rect(kx, ky + 1, 1.5, kpiH - 2, "F");

    doc.setFontSize(6);
    doc.setTextColor(...rgb(GABON_RGB.slate400));
    doc.setFont("helvetica", "bold");
    doc.text(kpis[i].label.toUpperCase(), kx + 4, ky + 5);
    doc.setFontSize(11);
    doc.setTextColor(...rgb(GABON_RGB.slate900));
    doc.text(kpis[i].value, kx + 4, ky + 12);
  }
  y += 2 * (kpiH + 3) + 6;

  const timelineRows = report.byTimeline.filter((item) => item.count > 0);
  if (timelineRows.length > 0) {
    y = ensureSpace(doc, y, 50, margin);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb(GABON_RGB.slate900));
    doc.text(report.period === "day" ? "Activité par heure" : "Activité par jour", margin, y);
    y += 5;
    drawVerticalBars(doc, timelineRows, margin, y, contentW, 35, timelineMax(report));
    y += 44;
  }

  if (report.byStatus.length > 0) {
    y = ensureSpace(doc, y, 55, margin);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Répartition par statut", margin, y);
    y += 4;
    const legendEnd = drawStatusLegend(doc, report.byStatus, margin, y);
    y = legendEnd + 4;

    const statusMax = Math.max(...report.byStatus.map((i) => i.count), 1);
    for (const item of report.byStatus) {
      y = ensureSpace(doc, y, 8, margin);
      doc.setFontSize(7);
      doc.setTextColor(...rgb(GABON_RGB.slate600));
      doc.setFont("helvetica", "normal");
      doc.text(statusLabel(item.status), margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rgb(GABON_RGB.slate900));
      doc.text(String(item.count), margin + contentW - 5, y);
      drawHorizontalBar(
        doc,
        margin,
        y + 1.5,
        contentW,
        3,
        item.count,
        statusMax,
        STATUS_CHART_RGB[item.status]
      );
      y += 8;
    }
    y += 4;
  }

  if (report.byDistrict.length > 0) {
    y = ensureSpace(doc, y, 40, margin);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb(GABON_RGB.slate900));
    doc.text("Top quartiers", margin, y);
    y += 5;

    const districtMax = Math.max(...report.byDistrict.map((i) => i.count), 1);
    for (const item of report.byDistrict.slice(0, 8)) {
      y = ensureSpace(doc, y, 8, margin);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...rgb(GABON_RGB.slate600));
      doc.text(item.district, margin, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rgb(GABON_RGB.slate900));
      doc.text(String(item.count), margin + contentW - 5, y);
      drawHorizontalBar(doc, margin, y + 1.5, contentW, 3, item.count, districtMax, GABON_RGB.green);
      y += 8;
    }
    y += 4;
  }

  if (report.byProduct.length > 0) {
    y = ensureSpace(doc, y, 30, margin);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Formats commandés", margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Format", "Commandes", "Montant"]],
      body: report.byProduct.map((item) => [
        item.label,
        String(item.count),
        formatPrice(item.revenue),
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: {
        fillColor: GABON_RGB.green as unknown as [number, number, number],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [230, 245, 239] },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  y = ensureSpace(doc, y, 12, margin);
  drawTricolorBar(doc, margin + contentW * 0.25, y, contentW * 0.5, 1.5);
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(...rgb(GABON_RGB.slate400));
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gab'Eau · Livraison d'eau à Libreville · ${new Date().toLocaleDateString("fr-FR")}`,
    pageW / 2,
    y
  );

  doc.save(`gab-eau-rapport-${periodSlug(report.period)}-${Date.now()}.pdf`);
}

function timelineMax(report: DashboardReport) {
  return Math.max(...report.byTimeline.map((i) => i.count), 1);
}

export async function exportDashboardToImage(element: HTMLElement, report: DashboardReport) {
  const { domToPng } = await import("modern-screenshot");

  const dataUrl = await domToPng(element, {
    scale: 2,
    backgroundColor: "#f8fafc",
    width: EXPORT_DOCUMENT_WIDTH,
    height: element.scrollHeight,
  });

  const link = document.createElement("a");
  link.download = `gab-eau-rapport-${periodSlug(report.period)}-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}
