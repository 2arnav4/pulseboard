/** Only same-origin paths are allowed after login, so ?callbackUrl= cannot send users to another site. */
export function safeCallbackUrl(value: string | string[] | undefined, fallback = "/"): string {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return fallback;
  return url;
}
