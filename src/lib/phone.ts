export function parsePhone(raw?: string | null): {
  code?: string;
  local?: string;
  e164?: string;
} {
  const v = (raw || "").trim();
  if (!v) return {};
  // Normalize: keep leading +, strip spaces/parentheses/dashes inside
  const digitsOnly = v.replace(/[^+\d]/g, "");
  const m = digitsOnly.match(/^(\+\d{1,3})(\d{3,})$/);
  if (!m) {
    return { e164: digitsOnly || undefined };
  }
  const code = m[1];
  const local = m[2];
  return { code, local, e164: `+${(code + local).replace(/\D/g, "")}`.replace(/^\+\+/, "+") };
}

