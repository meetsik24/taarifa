import { NextResponse } from "next/server";
import { destinationFor, startSession } from "@/lib/auth";
import { requestOrigin } from "@/lib/public-origin";
import { SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

function pageUrl(request: Request, path: string): URL {
  return new URL(path, requestOrigin(request));
}

function loginUrl(request: Request, error: string, next: string): URL {
  const url = pageUrl(request, "/ingia");
  url.searchParams.set("error", error);
  if (next !== "/") url.searchParams.set("next", next);
  return url;
}

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const requested = String(form.get("next") ?? "");
  try {
    const session = await startSession(email, password);
    if (!session) return NextResponse.redirect(loginUrl(request, "credentials", requested), 303);
    const response = NextResponse.redirect(pageUrl(request, destinationFor(session.role, requested)), 303);
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: requestOrigin(request).startsWith("https://"),
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(loginUrl(request, "unavailable", requested), 303);
  }
}
