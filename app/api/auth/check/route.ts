import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(token);

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
