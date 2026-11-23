import { NextResponse, type NextRequest } from "next/server";
import { allowedNext } from "@/lib/roles";
import { readSession, SESSION_COOKIE } from "@/lib/session";

function redirectTo(request: NextRequest, pathname: string, search: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  if (process.env.VERCEL === "1") url.protocol = "https:";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!session) return redirectTo(request, "/ingia", `?next=${encodeURIComponent(next)}`);

  const destination = allowedNext(session.role, request.nextUrl.pathname);
  if (destination !== request.nextUrl.pathname) return redirectTo(request, destination, "");
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/michoro/:path*", "/matokeo/:path*", "/jaza/:path*", "/wasimamizi/:path*", "/andika/:path*"],
};
