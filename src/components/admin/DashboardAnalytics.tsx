"use client";

import { type ReactNode, useRef, useState, useTransition } from "react";
import { getDashboardReport } from "@/actions/requests";
import { DashboardExportDocument } from "@/components/admin/DashboardExportDocument";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { exportDashboardToImage, exportDashboardToPDF } from "@/lib/dashboard-export";
import { formatReportDateRange, PERIOD_OPTIONS } from "@/lib/dashboard-report";
import type { DashboardReport, DashboardReportPeriod, DashboardStats } from "@/lib/types";

function SummaryKpi({
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
    <Card className={`!p-4 border-l-4 ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </Card>
  );
}

export function DashboardAnalytics({
  initialReport,
  overview,
  children,
}: {
  initialReport: DashboardReport;
  overview: DashboardStats;
  children: ReactNode;
}) {
  const exportDocRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState(initialReport);
  const [period, setPeriod] = useState<DashboardReportPeriod>(initialReport.period);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState<"pdf" | "image" | null>(null);
  const [exportError, setExportError] = useState("");

  function loadReport(nextPeriod: DashboardReportPeriod) {
    setPeriod(nextPeriod);
    startTransition(async () => {
      const data = await getDashboardReport(nextPeriod);
      setReport(data);
    });
  }

  async function handleExportPDF() {
    setIsExporting("pdf");
    try {
      await exportDashboardToPDF(report);
    } finally {
      setIsExporting(null);
    }
  }

  async function handleExportImage() {
    const element = exportDocRef.current?.querySelector<HTMLElement>("#dashboard-export-document");
    if (!element) return;
    setExportError("");
    setIsExporting("image");
    try {
      await exportDashboardToImage(element, report);
    } catch {
      setExportError("Export image impossible. Utilisez le PDF ou réessayez.");
    } finally {
      setIsExporting(null);
    }
  }

  const overviewDeliveryRate =
    overview.total > 0 ? Math.round((overview.delivered / overview.total) * 100) : 0;

  return (
    <>
      <div>
        <p className="text-xs text-slate-400 mb-2">Vue globale · toutes les demandes</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryKpi
            label="Demandes"
            value={String(overview.total)}
            accent="border-l-gabon-blue"
          />
          <SummaryKpi
            label="Assignés"
            value={String(overview.assigned)}
            hint="en livraison"
            accent="border-l-violet-500"
          />
          <SummaryKpi
            label="Livrées"
            value={String(overview.delivered)}
            hint={`${overviewDeliveryRate} %`}
            accent="border-l-gabon-green"
          />
          <SummaryKpi
            label="À traiter"
            value={String(overview.pending)}
            accent="border-l-amber-500"
          />
        </div>
      </div>

      {children}

      <Card className="!p-4 sm:!p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Exporter le rapport</h2>
            <p className="text-xs text-slate-500 mt-1">
              Le PDF inclut tous les indicateurs. L&apos;export image utilise un format document
              optimisé (paysage, 900 px), indépendant de l&apos;affichage mobile.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => loadReport(option.value)}
                disabled={isPending}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] ${
                  period === option.value
                    ? "bg-gabon-green text-white shadow-md"
                    : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-gabon-green-light"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            loading={isExporting === "pdf"}
            disabled={isPending || isExporting !== null}
          >
            Exporter PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportImage}
            loading={isExporting === "image"}
            disabled={isPending || isExporting !== null}
          >
            Exporter image
          </Button>
        </div>

        {exportError && (
          <p className="text-sm text-red-600 mb-4">{exportError}</p>
        )}

        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{report.periodLabel}</span>
          {" · "}
          {formatReportDateRange(report)}
          {" · "}
          {report.total} demande{report.total !== 1 ? "s" : ""}
        </div>

        <div
          ref={exportDocRef}
          aria-hidden
          className="fixed left-[-9999px] top-0 pointer-events-none"
        >
          <DashboardExportDocument report={report} />
        </div>
      </Card>
    </>
  );
}
