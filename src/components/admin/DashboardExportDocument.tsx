import type { ReactNode } from "react";
import { formatPrice } from "@/lib/business-rules";
import {
  GABON,
  KPI_ACCENTS,
  STATUS_CHART_COLORS,
} from "@/lib/dashboard-report-brand";
import { EXPORT_DOCUMENT_WIDTH } from "@/lib/dashboard-export";
import { formatReportDateRange, statusLabel } from "@/lib/dashboard-report";
import type { DashboardReport } from "@/lib/types";
import type { RequestStatus } from "@/lib/types";

const COLORS = {
  slate900: "#0f172a",
  slate600: "#475569",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  white: "#ffffff",
};

function GabonTricolorBar({ height = 5 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: `linear-gradient(90deg, ${GABON.green} 33.33%, ${GABON.yellow} 33.33%, ${GABON.yellow} 66.66%, ${GABON.blue} 66.66%)`,
      }}
    />
  );
}

function GabonFlagIcon({ size = 40 }: { size?: number }) {
  const h = size / 3;
  return (
    <div
      style={{
        width: size * 1.4,
        height: size,
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${COLORS.slate200}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      <div style={{ height: h, backgroundColor: GABON.green }} />
      <div style={{ height: h, backgroundColor: GABON.yellow }} />
      <div style={{ height: h, backgroundColor: GABON.blue }} />
    </div>
  );
}

function WaterDropLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${GABON.green} 0%, ${GABON.blue} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,135,81,0.25)",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="white">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
      </svg>
    </div>
  );
}

function ExportBar({
  label,
  value,
  max,
  color = GABON.green,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: COLORS.slate600,
          marginBottom: 4,
        }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color: COLORS.slate900 }}>{value}</span>
      </div>
      <div
        style={{
          height: 10,
          backgroundColor: COLORS.slate100,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color} 0%, ${GABON.blue} 100%)`,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function VerticalBarChart({
  items,
  max,
}: {
  items: { label: string; count: number; delivered: number }[];
  max: number;
}) {
  if (items.length === 0) {
    return <p style={{ fontSize: 11, color: COLORS.slate400, textAlign: "center" }}>Aucune donnée</p>;
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingTop: 8 }}>
      {items.map((item) => {
        const height = max > 0 ? Math.max(8, (item.count / max) * 100) : 8;
        const deliveredH =
          max > 0 && item.count > 0 ? Math.max(4, (item.delivered / max) * 100) : 0;
        return (
          <div
            key={item.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.slate900 }}>{item.count}</span>
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 36,
                height: 90,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${height}%`,
                  backgroundColor: GABON.greenLight,
                  border: `1px solid rgba(0,135,81,0.2)`,
                  borderRadius: "6px 6px 0 0",
                }}
              />
              {item.delivered > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${deliveredH}%`,
                    backgroundColor: GABON.green,
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontSize: 9,
                color: COLORS.slate400,
                textAlign: "center",
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  items,
}: {
  items: { status: RequestStatus; count: number }[];
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return <p style={{ fontSize: 11, color: COLORS.slate400 }}>Aucune donnée</p>;
  }

  let gradientParts: string[] = [];
  let cursor = 0;
  for (const item of items) {
    const pct = (item.count / total) * 100;
    const color = STATUS_CHART_COLORS[item.status];
    gradientParts.push(`${color} ${cursor}% ${cursor + pct}%`);
    cursor += pct;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `conic-gradient(${gradientParts.join(", ")})`,
          position: "relative",
          flexShrink: 0,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 22,
            borderRadius: "50%",
            backgroundColor: COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.slate900 }}>{total}</span>
          <span style={{ fontSize: 8, color: COLORS.slate400, fontWeight: 600 }}>total</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {items.map((item) => (
          <div
            key={item.status}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 5,
              fontSize: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: STATUS_CHART_COLORS[item.status],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: COLORS.slate600, fontWeight: 500 }}>
              {statusLabel(item.status)}
            </span>
            <span style={{ fontWeight: 700, color: COLORS.slate900 }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiBox({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.slate200}`,
        borderRadius: 10,
        padding: "10px 12px",
        borderLeft: `4px solid ${accent}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: COLORS.slate400,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: COLORS.slate900,
          margin: "4px 0 0",
        }}
      >
        {value}
      </p>
      {hint && (
        <p style={{ fontSize: 9, color: COLORS.slate400, margin: "2px 0 0" }}>{hint}</p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.slate200}`,
        borderRadius: 12,
        padding: 14,
        backgroundColor: COLORS.white,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <h2 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: COLORS.slate900 }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: 10, color: COLORS.slate400, margin: "4px 0 12px" }}>{subtitle}</p>
      )}
      {!subtitle && <div style={{ marginBottom: 12 }} />}
      {children}
    </div>
  );
}

export function DashboardExportDocument({ report }: { report: DashboardReport }) {
  const timelineMax = Math.max(...report.byTimeline.map((i) => i.count), 1);
  const districtMax = Math.max(...report.byDistrict.map((i) => i.count), 1);
  const statusMax = Math.max(...report.byStatus.map((i) => i.count), 1);
  const timelineItems = report.byTimeline.filter((i) => i.count > 0);

  const kpis = [
    { label: "Demandes", value: String(report.total) },
    { label: "Livrées", value: `${report.delivered} (${report.deliveryRate} %)` },
    { label: "À traiter", value: String(report.pending) },
    { label: "En livraison", value: String(report.assigned) },
    { label: "Chiffre d'affaires", value: formatPrice(report.revenueFcfa) },
    { label: "Volume", value: `${report.volumeLiters.toLocaleString("fr-FR")} L` },
    { label: "Panier moyen", value: formatPrice(report.avgOrderValue) },
    {
      label: "Urgentes",
      value: String(report.urgent),
      hint:
        report.cancelled + report.failed > 0
          ? `${report.cancelled} annul. · ${report.failed} échec(s)`
          : undefined,
    },
  ];

  return (
    <div
      id="dashboard-export-document"
      style={{
        width: EXPORT_DOCUMENT_WIDTH,
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        color: COLORS.slate900,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <GabonTricolorBar height={6} />

      <div
        style={{
          background: `linear-gradient(135deg, ${GABON.green} 0%, ${GABON.greenDark} 40%, ${GABON.blue} 100%)`,
          padding: "24px 28px 28px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 140,
            height: 140,
            borderRadius: "50%",
            backgroundColor: "rgba(252,209,22,0.15)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <WaterDropLogo />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: COLORS.white }}>
                Gab&apos;Eau
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: GABON.yellow,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {report.periodLabel}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "6px 0 0" }}>
              {formatReportDateRange(report)} · Libreville, Gabon
            </p>
          </div>
          <GabonFlagIcon size={36} />
        </div>
      </div>

      <div style={{ padding: "20px 28px 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {kpis.map((kpi, i) => (
            <KpiBox
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              hint={kpi.hint}
              accent={KPI_ACCENTS[i % KPI_ACCENTS.length]}
            />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <SectionCard
            title="Activité"
            subtitle={report.period === "day" ? "Par heure" : "Par jour"}
          >
            {timelineItems.length === 0 ? (
              <p style={{ fontSize: 11, color: COLORS.slate400, textAlign: "center" }}>
                Aucune donnée
              </p>
            ) : (
              <VerticalBarChart items={timelineItems} max={timelineMax} />
            )}
          </SectionCard>

          <SectionCard title="Par statut">
            {report.byStatus.length === 0 ? (
              <p style={{ fontSize: 11, color: COLORS.slate400 }}>Aucune donnée</p>
            ) : (
              <>
                <DonutChart items={report.byStatus} />
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.slate100}` }}>
                  {report.byStatus.map((item) => (
                    <ExportBar
                      key={item.status}
                      label={statusLabel(item.status)}
                      value={item.count}
                      max={statusMax}
                      color={STATUS_CHART_COLORS[item.status]}
                    />
                  ))}
                </div>
              </>
            )}
          </SectionCard>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <SectionCard title="Par quartier">
            {report.byDistrict.length === 0 ? (
              <p style={{ fontSize: 11, color: COLORS.slate400 }}>Aucune donnée</p>
            ) : (
              report.byDistrict.slice(0, 8).map((item) => (
                <ExportBar
                  key={item.district}
                  label={item.district}
                  value={item.count}
                  max={districtMax}
                />
              ))
            )}
          </SectionCard>

          <SectionCard title="Formats commandés">
            {report.byProduct.length === 0 ? (
              <p style={{ fontSize: 11, color: COLORS.slate400 }}>Aucune commande</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ color: COLORS.slate400, textAlign: "left" }}>
                    <th style={{ paddingBottom: 8, fontWeight: 700 }}>Format</th>
                    <th style={{ paddingBottom: 8, fontWeight: 700 }}>Cmd.</th>
                    <th style={{ paddingBottom: 8, fontWeight: 700 }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byProduct.map((item, i) => (
                    <tr
                      key={item.productType}
                      style={{
                        borderTop: `1px solid ${COLORS.slate100}`,
                        backgroundColor: i % 2 === 0 ? "transparent" : GABON.greenLight + "40",
                      }}
                    >
                      <td style={{ padding: "9px 0", fontWeight: 600 }}>
                        <svg
                          viewBox="0 0 24 24"
                          width={12}
                          height={12}
                          fill={GABON.blue}
                          style={{ marginRight: 6, verticalAlign: "middle" }}
                          aria-hidden
                        >
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
                        </svg>
                        {item.label}
                      </td>
                      <td style={{ padding: "9px 0", color: COLORS.slate600 }}>{item.count}</td>
                      <td style={{ padding: "9px 0", fontWeight: 700, color: GABON.green }}>
                        {formatPrice(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <GabonTricolorBar height={4} />
          <p style={{ fontSize: 9, color: COLORS.slate400, margin: "10px 0 0" }}>
            Gab&apos;Eau · Livraison d&apos;eau à Libreville · Rapport généré le{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
