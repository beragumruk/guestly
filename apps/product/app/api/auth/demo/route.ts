import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createWorkspaceAccessToken, DEMO_ACCESS_EMAIL, getWorkspaceSession, hasDemoAccessPassword, WORKSPACE_ACCESS_COOKIE, workspaceSessionMaxAge } from "@/lib/auth";

export async function GET() {
  const storedToken = (await cookies()).get(WORKSPACE_ACCESS_COOKIE)?.value;
  return NextResponse.json({ ok: Boolean(await getWorkspaceSession(storedToken)) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  const password = body?.password || "";
  const expectedPassword = process.env.GUESTLY_DEMO_PASSWORD || "";

  if (!hasDemoAccessPassword() || email !== DEMO_ACCESS_EMAIL.toLowerCase() || password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(WORKSPACE_ACCESS_COOKIE, await createWorkspaceAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: workspaceSessionMaxAge(),
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(WORKSPACE_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
