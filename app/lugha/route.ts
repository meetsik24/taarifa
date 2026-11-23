import { NextResponse } from "next/server";
import { isLocale, LANG_COOKIE } from "@/lib/messages";

function safeBack(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return "/";
  }
  return value;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const raw = String(form.get("lang") ?? "");
  const lang = isLocale(raw) ? raw : "sw";
  const back = safeBack(String(form.get("back") ?? "/"));
  const response = NextResponse.redirect(new URL(back, request.url), 303);
  response.cookies.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  return response;
}
