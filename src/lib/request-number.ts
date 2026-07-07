import type { SupabaseClient } from "@supabase/supabase-js";

/** Parse EAU-154 or legacy EAU-2026-000154 → sequence number. */
export function parseRequestNumberSequence(requestNumber: string): number {
  const normalized = requestNumber.trim().toUpperCase();
  const simple = /^EAU-(\d+)$/.exec(normalized);
  if (simple) return parseInt(simple[1], 10);

  const legacy = /^EAU-\d{4}-0*(\d+)$/.exec(normalized);
  if (legacy) return parseInt(legacy[1], 10);

  return 0;
}

export function formatRequestNumber(sequence: number): string {
  return `EAU-${sequence}`;
}

/** Variants for lookup when the user types 12, EAU-12, EAU-2026-000012, etc. */
export function requestNumberLookupVariants(input: string): string[] {
  const trimmed = input.trim().toUpperCase();
  const variants = new Set<string>();
  if (!trimmed) return [];

  variants.add(trimmed);

  const sequencePart = trimmed.replace(/^EAU-?/i, "").replace(/\D/g, "");
  if (!sequencePart) return [...variants];

  const sequence = parseInt(sequencePart, 10);
  if (!Number.isFinite(sequence) || sequence <= 0) return [...variants];

  variants.add(formatRequestNumber(sequence));

  const year = new Date().getFullYear();
  variants.add(`EAU-${year}-${String(sequence).padStart(6, "0")}`);

  return [...variants];
}

export async function allocateRequestNumber(supabase: SupabaseClient): Promise<string> {
  const { data: rows } = await supabase
    .from("requests")
    .select("request_number")
    .order("created_at", { ascending: false })
    .limit(300);

  let max = 0;
  for (const row of rows ?? []) {
    max = Math.max(max, parseRequestNumberSequence(row.request_number));
  }

  const year = new Date().getFullYear();
  const { data: counter } = await supabase
    .from("request_counters")
    .select("last_number")
    .eq("year", year)
    .maybeSingle();

  if (counter?.last_number) {
    max = Math.max(max, counter.last_number);
  }

  return formatRequestNumber(max + 1);
}

export async function syncRequestCounter(
  supabase: SupabaseClient,
  requestNumber: string
): Promise<void> {
  const sequence = parseRequestNumberSequence(requestNumber);
  if (sequence <= 0) return;

  const year = new Date().getFullYear();
  const { data: counter } = await supabase
    .from("request_counters")
    .select("last_number")
    .eq("year", year)
    .maybeSingle();

  if (!counter || counter.last_number < sequence) {
    await supabase.from("request_counters").upsert(
      { year, last_number: sequence },
      { onConflict: "year" }
    );
  }
}
