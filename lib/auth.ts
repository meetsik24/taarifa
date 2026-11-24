import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAdminByEmail } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { allowedNext, homeFor, type Role } from "@/lib/roles";
import { readSession, SESSION_COOKIE, signSession, type SessionPayload } from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/ingia");
  return session;
}

export async function requireStaff(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role === "filler") redirect("/andika");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireStaff();
  if (session.role !== "super_admin") redirect("/");
  return session;
}

/** Empty string means every zone. A zone name limits the dashboard to that zone. */
export async function dashboardZone(): Promise<string> {
  const session = await requireStaff();
  if (session.role !== "admin") return "";
  const admin = await findAdminByEmail(session.email);
  if (!admin || admin.role !== "admin") return "";
  return admin.kanda;
}

export function destinationFor(role: Role, next: string | undefined): string {
  return allowedNext(role, next ?? homeFor(role));
}

export async function startSession(email: string, password: string): Promise<{ role: Role; token: string } | null> {
  const admin = await findAdminByEmail(email.trim());
  if (!admin) return null;
  const matches = await verifyPassword(password.trim(), admin.passwordHash);
  if (!matches) return null;
  const token = await signSession({ email: admin.email, name: admin.name, role: admin.role });
  return { role: admin.role, token };
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
