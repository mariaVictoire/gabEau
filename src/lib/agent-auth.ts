const AGENT_EMAIL_DOMAIN = "agents.gabeau.internal";

export function normalizeAgentCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function agentAuthEmail(agentCode: string): string {
  return `${normalizeAgentCode(agentCode).toLowerCase()}@${AGENT_EMAIL_DOMAIN}`;
}

export function isValidAgentCode(code: string): boolean {
  const normalized = normalizeAgentCode(code);
  return /^[A-Z0-9]{3,12}$/.test(normalized);
}

export function isValidAgentPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}

/** Initiales pour le code agent : ex. « ACD Maria » → AM, « Ateli » → ATEL */
export function extractAgentPrefix(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AG";

  const clean = (word: string) => word.replace(/[^a-zA-ZÀ-ÿ0-9]/gi, "");

  if (parts.length === 1) {
    const word = clean(parts[0]).toUpperCase();
    if (!word) return "AG";
    return word.length <= 4 ? word : word.slice(0, 4);
  }

  const first = clean(parts[0])[0] || "";
  const last = clean(parts[parts.length - 1])[0] || "";
  const initials = (first + last).toUpperCase();
  return initials.length >= 2 ? initials : `${initials}X`.slice(0, 2);
}

export function generateAgentPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function formatAgentCode(prefix: string, number: number): string {
  return `${prefix}${String(number).padStart(3, "0")}`;
}

export function parseAgentCodeNumber(agentCode: string, prefix: string): number | null {
  const match = agentCode.match(new RegExp(`^${prefix}(\\d+)$`));
  return match ? parseInt(match[1], 10) : null;
}
