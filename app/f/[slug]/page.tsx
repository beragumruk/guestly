"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, MessageSquareText, ShieldCheck } from "lucide-react";
import { findLocationBySlug, getState, submitFeedback } from "@/lib/store";
import type { FeedbackLocation, Organization } from "@/lib/types";
import { Button, Card, FormField, Input, Textarea } from "@/components/ui";
import { LogoMark } from "@/components/app-shell";

export default function PublicFeedbackPage() {
  const routeParams = useParams<{ slug: string }>();
  const slug = routeParams.slug;
  const [location, setLocation] = useState<FeedbackLocation | null | undefined>(undefined);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const found = findLocationBySlug(slug);
    setLocation(found || null);
    setOrganization(getState().organization);
  }, [slug]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location || !message.trim()) return;
    submitFeedback({
      locationId: location.id,
      rating,
      message,
      guestName,
      guestEmail,
      visitContext: "Public QR submission",
    });
    setSubmitted(true);
  }

  if (location === undefined) {
    return <main className="grid min-h-screen place-items-center text-sm text-zinc-500">Opening feedback link...</main>;
  }

  if (!location || !organization) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-md p-6 text-center">
          <LogoMark />
          <h1 className="mt-8 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">Feedback link unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">This Guestly feedback link is inactive or does not exist. Please ask the team for a current link.</p>
        </Card>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-8">
        <Card className="max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-950 text-zinc-50">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">Thank you for telling us.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Your feedback has been routed to {organization.name}. The team can now review the signal and act on it quickly.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <LogoMark />
        </div>
        <Card className="overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-950 p-5 text-zinc-50">
            <p className="mono-label text-zinc-400">{organization.name}</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{location.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">Reference {location.referenceCode}</p>
          </div>
          <form className="grid gap-5 p-5" onSubmit={submit}>
            <div>
              <p className="field-label">Rating (optional)</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                    className={`h-11 rounded-lg border text-sm font-semibold transition ${
                      rating === value ? "border-zinc-950 bg-zinc-950 text-zinc-50" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <FormField label="What should the team know?">
              <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a quick note about your experience." required />
            </FormField>
            <FormField label="Name (optional)">
              <Input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" />
            </FormField>
            <FormField label="Email (optional)">
              <Input type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="you@example.com" />
            </FormField>
            <Button type="submit" className="w-full">
              <MessageSquareText className="h-4 w-4" />
              Submit feedback
            </Button>
          </form>
        </Card>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 p-3 text-xs leading-5 text-zinc-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-500" />
          Feedback goes directly to the operator workflow for this location.
        </div>
      </div>
    </main>
  );
}
