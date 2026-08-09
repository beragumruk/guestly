import { NextResponse } from "next/server";
import { deliverWebhook } from "@/lib/integrations/dispatcher";
import { isIntegrationStoreAvailable } from "@/lib/integrations/repository";
import { IntegrationAccessError, requireIntegrationAdmin } from "@/lib/integrations/server-auth";
import { getState } from "@/lib/store";

function failure(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Webhook test failed." }, { status: error instanceof IntegrationAccessError ? 401 : 400 });
}

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireIntegrationAdmin();
    if (!isIntegrationStoreAvailable()) throw new Error("Integration storage is not configured.");
    const { id } = await context.params;
    const state = getState();
    const feedback = state.feedback[0];
    const location = state.locations.find((item) => item.id === feedback?.locationId);
    if (!feedback || !location) throw new Error("A sample feedback item is required to send a test.");
    await deliverWebhook({ event: "feedback.created", organizationId, feedback, location }, id);
    return NextResponse.json({ ok: true, message: "Test webhook delivered." });
  } catch (error) {
    return failure(error);
  }
}
