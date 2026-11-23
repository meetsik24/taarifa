type HeaderSource = {
  get(name: string): string | null;
};

function firstHeader(value: string | null): string {
  return value?.split(",")[0]?.trim() ?? "";
}

function publicProtocol(forwardedProto: string | null, fallback: string): "http" | "https" {
  if (process.env.VERCEL === "1") return "https";
  const forwarded = firstHeader(forwardedProto);
  if (forwarded === "https" || forwarded === "http") return forwarded;
  return fallback === "https" ? "https" : "http";
}

export function publicOriginFrom(headerStore: HeaderSource, fallbackOrigin = ""): string {
  const host = firstHeader(headerStore.get("x-forwarded-host")) || firstHeader(headerStore.get("host"));
  if (!host) return fallbackOrigin;
  const fallbackProtocol = fallbackOrigin.startsWith("https://") ? "https" : "http";
  const protocol = publicProtocol(headerStore.get("x-forwarded-proto"), fallbackProtocol);
  return `${protocol}://${host}`;
}

export function requestOrigin(request: Request): string {
  return publicOriginFrom(request.headers, new URL(request.url).origin);
}
