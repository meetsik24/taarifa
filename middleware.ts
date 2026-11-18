import { NextResponse, type NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const url = request.nextUrl.clone();
  url.pathname = "/ingia";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/wasimamizi", "/wasimamizi/:path*"],
};
