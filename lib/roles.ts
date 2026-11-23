import { copy, type Locale } from "@/lib/messages";

export const ROLES = ["super_admin", "admin", "filler"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function roleLabel(role: Role, locale: Locale = "sw"): string {
  return copy[locale].roles[role];
}

export function homeFor(role: Role): string {
  return role === "filler" ? "/andika" : "/";
}

export function allowedNext(role: Role, next: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/ingia")) {
    return homeFor(role);
  }
  if (role === "filler") return next === "/andika" || next.startsWith("/andika/") ? next : "/andika";
  if (role === "admin" && (next === "/wasimamizi" || next.startsWith("/wasimamizi/"))) return "/";
  return next;
}
