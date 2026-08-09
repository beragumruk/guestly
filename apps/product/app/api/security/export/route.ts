import { NextResponse } from "next/server";
import { requirePermission, AccessError } from "@/lib/security/server-auth";

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export async function GET() {
  try {
    const actor = await requirePermission("manage_privacy");
    const database = databaseConfig();
    if (!database) throw new Error("Organization export requires configured production storage.");
    const response = await fetch(`${database.url}/rest/v1/feedback?organization_id=eq.${encodeURIComponent(actor.organizationId)}&select=*&order=created_at.desc`, { headers: { apikey: database.key, Authorization: `Bearer ${database.key}` }, cache: "no-store" });
    if (!response.ok) throw new Error("Organization export could not be prepared.");
    const feedback = await response.json();
    return NextResponse.json({ exportedAt: new Date().toISOString(), organizationId: actor.organizationId, feedback }, { headers: { "Content-Disposition": `attachment; filename=guestly-organization-export-${new Date().toISOString().slice(0, 10)}.json` } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Organization export failed." }, { status: error instanceof AccessError ? 403 : 400 });
  }
}
