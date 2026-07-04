import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";

const dotColors: Record<RequestStatus, string> = {
  received: "bg-blue-500",
  in_review: "bg-amber-500",
  assigned: "bg-violet-500",
  in_progress: "bg-orange-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-slate-400",
  failed_delivery: "bg-red-500",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
