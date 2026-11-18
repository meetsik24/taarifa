import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  await endSession();
  return NextResponse.redirect(new URL("/ingia", request.url), 303);
}
