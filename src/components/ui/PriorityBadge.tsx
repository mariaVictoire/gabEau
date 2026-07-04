import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import type { RequestPriority } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${PRIORITY_COLORS[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
