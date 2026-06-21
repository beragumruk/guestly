"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, QrCode, Sparkles } from "lucide-react";
import { getSession, signInManager } from "@/lib/store";
import { Button, Card, FormField, Input } from "@/components/ui";
import { LogoMark } from "@/components/app-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  function continueToWorkspace() {
    signInManager();
    router.replace("/dashboard");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    continueToWorkspace();
  }

  return (
    <main className="grid min-h-screen px-4 py-8 lg:grid-cols-[1fr_34rem] lg:px-8">
      <section className="hidden min-h-[calc(100vh-4rem)] flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-950 p-8 text-zinc-50 shadow-[var(--shadow-panel)] lg:flex">
        <div className="flex items-center justify-between">
          <LogoMark />
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">Manager access</span>
        </div>
        <div className="max-w-xl">
          <p className="mono-label text-zinc-500">Feedback intelligence</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-zinc-50">
            Turn silent guest feedback into operational action.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">
            A Guestly workspace for intake, classification, priority routing, analytics, and action tracking.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["QR intake", QrCode],
            ["Risk scoring", Sparkles],
            ["Secure access", LockKeyhole],
          ].map(([label, Icon]) => (
            <div key={label as string} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <Icon className="h-4 w-4 text-zinc-400" />
              <p className="mt-4 text-sm font-medium text-zinc-200">{label as string}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center lg:px-8">
        <Card className="w-full max-w-md p-6">
          <div className="mb-8">
            <LogoMark />
            <p className="mono-label mt-8">Manager login</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">Access Guestly</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">Enter the manager workspace with credentials issued by Guestly.</p>
          </div>
          <form className="grid gap-4" onSubmit={submit}>
            <FormField label="Email">
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
            <FormField label="Password">
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </FormField>
            <Button type="submit" className="w-full">
              Continue to Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
