import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAdminByEmail } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { readSession, SESSION_COOKIE, signSession, type SessionPayload } from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/ingia");
  return session;
}

export function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/ingia")) {
    return "/";
  }
  return value;
}

export async function startSession(email: string, password: string): Promise<boolean> {
  const admin = await findAdminByEmail(email);
  if (!admin) return false;
  const matches = await verifyPassword(password, admin.passwordHash);
  if (!matches) return false;
  const token = await signSession({ email: admin.email, name: admin.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return true;
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
