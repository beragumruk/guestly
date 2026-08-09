import { NextResponse } from "next/server";
import { classifyFeedback } from "@/lib/classifier";
import { dispatchIntegrations } from "@/lib/integrations/dispatcher";
import { getPublicLocation, insertFeedback, isIntegrationStoreAvailable } from "@/lib/integrations/repository";
import type { Feedback } from "@/lib/types";

function rateLimitKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

const submissions = new Map<string, number>();

function canAcceptSubmission(request: Request) {
  const key = rateLimitKey(request);
  const now = Date.now();
  const last = submissions.get(key) || 0;
  if (now - last < 10_000) return false;
  submissions.set(key, now);
  return true;
}

export async function POST(request: Request) {
  try {
    if (!isIntegrationStoreAvailable()) return NextResponse.json({ ok: true, persisted: false });
    if (!canAcceptSubmission(request)) return NextResponse.json({ ok: false, message: "Please wait a moment before submitting again." }, { status: 429 });
    const body = (await request.json()) as { slug?: unknown; rating?: unknown; message?: unknown; guestName?: unknown; guestEmail?: unknown; visitContext?: unknown };
    if (typeof body.slug !== "string" || typeof body.message !== "string" || body.message.trim().length === 0 || body.message.length > 4000) {
      return NextResponse.json({ ok: false, message: "A valid feedback message is required." }, { status: 400 });
    }
    const location = await getPublicLocation(body.slug);
    if (!location) return NextResponse.json({ ok: false, message: "Feedback link unavailable." }, { status: 404 });
    const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? (body.rating as 1 | 2 | 3 | 4 | 5) : undefined;
    const message = body.message.trim();
    const classification = classifyFeedback(message, rating);
    const now = new Date().toISOString();
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      organizationId: location.organizationId,
      locationId: location.id,
      rating,
      message,
      guestName: typeof body.guestName === "string" ? body.guestName.trim().slice(0, 180) || undefined : undefined,
      guestEmail: typeof body.guestEmail === "string" ? body.guestEmail.trim().slice(0, 320) || undefined : undefined,
      visitContext: typeof body.visitContext === "string" ? body.visitContext.trim().slice(0, 180) || undefined : undefined,
      ...classification,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };
    await insertFeedback(feedback);
    const event = feedback.priority === "high" || feedback.priority === "critical" ? "feedback.urgent" : "feedback.created";
    await dispatchIntegrations({ event, organizationId: location.organizationId, feedback, location });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Unable to submit feedback." }, { status: 500 });
  }
}
