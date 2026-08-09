import { NextResponse } from "next/server";
import { deliverDailyEmailSummary } from "@/lib/integrations/dispatcher";
import { isIntegrationStoreAvailable, listDailyEmailConnections, listDailyFeedback } from "@/lib/integrations/repository";
import type { EmailIntegrationConfig } from "@/lib/integrations/types";

function authorized(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const secret = process.env.GUESTLY_CRON_SECRET || process.env.CRON_SECRET;
  return Boolean(token && secret && token === secret);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  if (!isIntegrationStoreAvailable()) return NextResponse.json({ ok: false, message: "Integration storage is not configured." }, { status: 503 });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const connections = await listDailyEmailConnections();
  const results = await Promise.all(
    connections.map(async (connection) => {
      try {
        const feedback = await listDailyFeedback(connection.organizationId, since);
        const config = connection.config as EmailIntegrationConfig;
        await deliverDailyEmailSummary({ recipients: config.recipients, organizationName: "Guestly workspace", feedback });
        return { organizationId: connection.organizationId, ok: true };
      } catch (error) {
        return { organizationId: connection.organizationId, ok: false, message: error instanceof Error ? error.message : "Daily summary failed." };
      }
    }),
  );
  return NextResponse.json({ ok: true, results });
}
