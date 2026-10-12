/** Only allow local return destinations, never the authentication page itself. */
export function safeAuthRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/account";
  try {
    const url = new URL(value, "https://local.invalid");
    const path = decodeURIComponent(url.pathname).replace(/\\/g, "/");
    if (url.origin !== "https://local.invalid" || /^\/auth(?:\/|$)/i.test(path)) return "/account";
    return url.pathname + url.search + url.hash;
  } catch { return "/account"; }
}

export function normalizeOtp(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) - (digit >= "۰" ? 0x6f0 : 0x660))).replace(/\D/g, "").slice(0, 6);
}
