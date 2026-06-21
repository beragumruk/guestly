import { NextRequest, NextResponse } from "next/server";
import { isValidWorkspaceAccessToken, WORKSPACE_ACCESS_COOKIE } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(WORKSPACE_ACCESS_COOKIE)?.value;

  if (await isValidWorkspaceAccessToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
