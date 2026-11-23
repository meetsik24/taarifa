import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/public-origin";
import { SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const origin = requestOrigin(request);
  const response = NextResponse.redirect(new URL("/ingia", origin), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 0,
  });
  return response;
}
