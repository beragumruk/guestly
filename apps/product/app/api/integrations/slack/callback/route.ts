import { NextResponse } from "next/server";
import { saveConnection } from "@/lib/integrations/repository";
import { readSlackState, slackOAuthConfigured } from "@/lib/integrations/slack";

export async function GET(request: Request) {
  const returnUrl = new URL("/dashboard/settings/integrations", request.url);
  try {
    if (!slackOAuthConfigured()) throw new Error("Slack OAuth has not been configured yet.");
    const { searchParams } = new URL(request.url);
    const error = searchParams.get("error");
    if (error) throw new Error(`Slack connection was cancelled: ${error}.`);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) throw new Error("Slack did not return a valid connection response.");
    const payload = readSlackState(state);
    const credentials = Buffer.from(`${process.env.SLACK_CLIENT_ID}:${process.env.SLACK_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, redirect_uri: process.env.SLACK_REDIRECT_URI! }),
    });
    const body = (await response.json()) as { ok?: boolean; error?: string; access_token?: string; team?: { name?: string } };
    if (!response.ok || !body.ok || !body.access_token) throw new Error(`Slack connection failed${body.error ? `: ${body.error}` : "."}`);
    await saveConnection({
      organizationId: payload.organizationId,
      provider: "slack",
      enabled: false,
      status: "needs_attention",
      config: { channelId: "", channelName: body.team?.name || "Slack workspace", events: ["feedback.urgent"] },
      secret: body.access_token,
    });
    returnUrl.searchParams.set("slack", "connected");
  } catch (error) {
    returnUrl.searchParams.set("slack_error", error instanceof Error ? error.message : "Slack connection failed.");
  }
  return NextResponse.redirect(returnUrl);
}
