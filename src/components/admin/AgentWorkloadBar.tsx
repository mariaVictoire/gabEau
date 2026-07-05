import { MAX_ASSIGNMENTS_PER_AGENT } from "@/lib/auto-assign";

export function AgentWorkloadBar({
  activeCount,
  max = MAX_ASSIGNMENTS_PER_AGENT,
  compact = false,
}: {
  activeCount: number;
  max?: number;
  compact?: boolean;
}) {
  const pct = Math.min(100, (activeCount / max) * 100);
  const full = activeCount >= max;
  const empty = activeCount === 0;

  const barColor = full
    ? "bg-red-500"
    : activeCount >= max - 2
      ? "bg-amber-500"
      : "bg-gabon-green";

  return (
    <div className={compact ? "w-full max-w-[140px]" : "w-full"}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Charge
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            full ? "text-red-600" : empty ? "text-slate-400" : "text-gabon-green-dark"
          }`}
        >
          {activeCount}/{max}
          {full && !compact && (
            <span className="ml-1 text-[10px] font-semibold uppercase">· Complet</span>
          )}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
