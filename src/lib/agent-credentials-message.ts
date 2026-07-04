/** Numéro international Gabon pour liens SMS / WhatsApp (ex. 241062345678) */
export function formatPhoneForMessaging(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;

  if (digits.startsWith("241") && digits.length >= 11) return digits;
  if (digits.startsWith("0")) return `241${digits.slice(1)}`;
  if (digits.length === 8 || digits.length === 9) return `241${digits}`;

  return digits.startsWith("241") ? digits : null;
}

export function buildAgentCredentialsMessage(input: {
  full_name: string;
  agent_code: string;
  pin: string;
  loginUrl: string;
}): string {
  return [
    `Bonjour ${input.full_name},`,
    "",
    "Votre compte agent Gab'Eau est prêt.",
    `Code agent : ${input.agent_code}`,
    `Code PIN : ${input.pin}`,
    "",
    `Connexion : ${input.loginUrl}`,
  ].join("\n");
}

export function buildSmsLink(phone: string, message: string): string | null {
  const formatted = formatPhoneForMessaging(phone);
  if (!formatted) return null;
  return `sms:+${formatted}?body=${encodeURIComponent(message)}`;
}

export function buildWhatsAppLink(phone: string, message: string): string | null {
  const formatted = formatPhoneForMessaging(phone);
  if (!formatted) return null;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}
