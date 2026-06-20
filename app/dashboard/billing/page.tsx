"use client";

import { Check, MessageSquareText } from "lucide-react";
import { subscriptionPlans } from "@/lib/workspace-data";
import { Card, PageHeader } from "@/components/ui";
import { useGuestly } from "@/components/use-guestly";

export default function BillingPage() {
  const state = useGuestly();
  if (!state) return null;

  function requestPlanReview() {
    window.alert("Request received. The Guestly team will follow up with next steps.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Plans for structured guest intelligence."
        text="Review plan access, included intelligence features, and expansion paths for your hospitality operation."
      />
      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mono-label">Current plan</p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">Guestly Core</h2>
            <p className="mt-2 text-sm text-zinc-500">{state.organization.name} has active Guestly workspace access.</p>
          </div>
          <span className="w-fit rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
            {state.organization.subscriptionStatus}
          </span>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={`p-6 ${plan.featured ? "border-zinc-400 bg-zinc-50/95" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono-label">{plan.featured ? "Recommended" : "Starter"}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">{plan.name}</h2>
              </div>
              {plan.featured && <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-600">Popular</span>}
            </div>
            <div className="mt-7 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.06em] text-zinc-950">${plan.price}</span>
              <span className="pb-2 text-sm text-zinc-500">/{plan.interval}</span>
            </div>
            <div className="mt-7 grid gap-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-700">
                  <Check className="h-4 w-4 text-zinc-950" />
                  {feature}
                </div>
              ))}
            </div>
            <button className="button-primary mt-8 w-full" type="button" onClick={requestPlanReview}>
              <MessageSquareText className="h-4 w-4" />
              {plan.featured ? "Talk to Sales" : "Request Plan Review"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
