import { NextResponse } from "next/server";
import { requireIntegrationAdmin, IntegrationAccessError } from "@/lib/integrations/server-auth";
import { createSlackState, slackOAuthConfigured } from "@/lib/integrations/slack";

export async function GET() {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!slackOAuthConfigured()) return NextResponse.json({ ok: false, message: "Slack OAuth has not been configured yet." }, { status: 503 });
    const url = new URL("https://slack.com/oauth/v2/authorize");
    url.searchParams.set("client_id", process.env.SLACK_CLIENT_ID!);
    url.searchParams.set("redirect_uri", process.env.SLACK_REDIRECT_URI!);
    url.searchParams.set("scope", "chat:write,channels:read,groups:read");
    url.searchParams.set("state", createSlackState(organizationId));
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Unable to start Slack connection." }, { status: error instanceof IntegrationAccessError ? 401 : 400 });
  }
}
