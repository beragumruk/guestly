"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, QrCode, Sparkles, TrendingUp } from "lucide-react";
import { signInManager } from "@/lib/store";
import { Button, Card, FormField, Input } from "@/components/ui";
import { LogoMark } from "@/components/app-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/demo")
      .then((response) => response.json())
      .then((result: { ok?: boolean }) => {
        if (!active || !result.ok) return;
        signInManager();
        router.replace("/dashboard");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("Invalid credentials.");
        return;
      }

      signInManager();
      router.replace("/dashboard");
    } catch {
      setError("Unable to verify credentials. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:grid lg:place-items-center lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/82 shadow-[0_32px_110px_-72px_rgba(24,24,27,0.62)] backdrop-blur lg:min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-zinc-950 text-zinc-50 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,244,245,0.08),transparent_24%),linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
          <div className="relative flex h-full flex-col p-8">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-800 bg-zinc-50 text-zinc-950">
                  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-6 w-6">
                    <path
                      d="M48.8 18.7A22 22 0 1 0 51.6 36H37.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7.5"
                      strokeLinecap="butt"
                      strokeLinejoin="round"
                    />
                    <circle cx="27.4" cy="32" r="5.8" fill="currentColor" />
                  </svg>
                </span>
                <span className="text-base font-semibold tracking-tight text-zinc-50">Guestly</span>
              </div>
              <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">Workspace login</span>
            </div>

            <div className="mt-16 max-w-2xl">
              <p className="mono-label text-zinc-500">Feedback intelligence</p>
              <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-zinc-50">
                Turn silent guest feedback into operational action.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
                A Guestly workspace for intake, classification, priority routing, analytics, and action tracking.
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              {[
                ["Critical allergen signal", "Routed to service lead", "2 min", "Critical"],
                ["Recurring wait-time pattern", "Counter service trend", "18 signals", "High"],
                ["Positive staff mention", "Captured for team rollup", "Today", "Low"],
              ].map(([title, detail, meta, priority]) => (
                <div key={title} className="grid grid-cols-[1fr_auto] gap-5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">{meta}</p>
                    <p className="mt-2 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300">{priority}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto grid grid-cols-3 gap-3 pt-10">
              {[
                ["QR intake", QrCode],
                ["Risk scoring", Sparkles],
                ["Trend detection", TrendingUp],
              ].map(([label, Icon]) => (
                <div key={label as string} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <p className="mt-4 text-sm font-medium text-zinc-200">{label as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-10 sm:px-8 lg:min-h-0 lg:px-12">
          <Card className="w-full max-w-md border-zinc-200/95 bg-white p-6 shadow-[0_26px_80px_-62px_rgba(24,24,27,0.72)] sm:p-7">
            <div className="mb-8">
              <LogoMark />
              <p className="mono-label mt-8">Workspace login</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">Access Guestly</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">Enter the workspace with credentials issued by Guestly.</p>
            </div>
            <form className="grid gap-4" onSubmit={submit}>
              <FormField label="Email">
                <Input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormField>
              <FormField label="Password">
                <Input
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormField>
              {error ? (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
                  {error}
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Verifying..." : "Continue to Workspace"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-5 grid gap-2 text-xs leading-5 text-zinc-500">
              {[
                ["Secure workspace session", LockKeyhole],
                ["Signals persist locally for review", CheckCircle2],
                ["Designed for fast operator handoff", Clock3],
              ].map(([text, Icon]) => (
                <div key={text as string} className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{text as string}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
