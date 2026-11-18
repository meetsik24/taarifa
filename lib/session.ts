export const SESSION_COOKIE = "wad_session";
const SESSION_SECONDS = 60 * 60 * 12;

export type SessionPayload = {
  email: string;
  name: string;
  exp: number;
};

function secret(): string {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET is missing.");
  return value;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function hmacKey(operation: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [operation],
  );
}

export async function signSession(input: { email: string; name: string }): Promise<string> {
  const payload: SessionPayload = {
    email: input.email,
    name: input.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey("sign"),
    new TextEncoder().encode(body),
  );
  return `${body}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token || !process.env.AUTH_SECRET?.trim()) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || token.split(".").length !== 2) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey("verify"),
      base64UrlToBytes(signature),
      new TextEncoder().encode(body),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as SessionPayload;
    if (!payload.email || !payload.name || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
