import { NextResponse } from "next/server";
import { safeNextPath, startSession } from "@/lib/auth";

export const runtime = "nodejs";

function loginUrl(request: Request, error: string, next: string): URL {
  const url = new URL("/ingia", request.url);
  url.searchParams.set("error", error);
  if (next !== "/") url.searchParams.set("next", next);
  return url;
}

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(String(form.get("next") ?? ""));
  try {
    const ok = await startSession(email, password);
    if (!ok) return NextResponse.redirect(loginUrl(request, "credentials", next), 303);
    return NextResponse.redirect(new URL(next, request.url), 303);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(loginUrl(request, "unavailable", next), 303);
  }
}
