const REDIRECT_ORIGIN = "https://visuallearning.local";

/** Only return normalized paths on this app, never a different host or scheme. */
export function safeInternalRedirect(value: string | null | undefined): string | null {
  if (!value || value !== value.trim()) return null;
  let decoded = value;
  try {
    // Reject encoded slash/backslash and control-character tricks as well.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return null;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (attempt === 4) return null;
    }
    const url = new URL(value, REDIRECT_ORIGIN);
    if (url.origin !== REDIRECT_ORIGIN || url.pathname.startsWith("//")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function authLink(path: "/auth/login" | "/auth/signup" | "/auth/forgot-password", next: string | null | undefined) {
  const destination = safeInternalRedirect(next);
  return destination ? `${path}?next=${encodeURIComponent(destination)}` : path;
}
