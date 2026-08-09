import { NextResponse } from "next/server";
import { dispatchIntegrations } from "@/lib/integrations/dispatcher";
import { isIntegrationStoreAvailable } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import type { Feedback, FeedbackLocation } from "@/lib/types";
import { integrationEvents, type IntegrationEvent } from "@/lib/integrations/types";

export async function POST(request: Request) {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!isIntegrationStoreAvailable()) return NextResponse.json({ ok: true, skipped: "Integration storage is not configured." });
    const body = (await request.json()) as { event?: unknown; feedback?: Feedback; location?: FeedbackLocation };
    if (typeof body.event !== "string" || !integrationEvents.includes(body.event as IntegrationEvent) || !body.feedback || !body.location) {
      return NextResponse.json({ ok: false, message: "Invalid integration event." }, { status: 400 });
    }
    if (body.feedback.organizationId !== organizationId || body.location.organizationId !== organizationId) {
      return NextResponse.json({ ok: false, message: "Organization mismatch." }, { status: 403 });
    }
    const outcomes = await dispatchIntegrations({ event: body.event as IntegrationEvent, organizationId, feedback: body.feedback, location: body.location });
    return NextResponse.json({ ok: true, outcomes });
  } catch (error) {
    const status = error instanceof IntegrationAccessError ? 401 : 500;
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Integration dispatch failed." }, { status });
  }
}
