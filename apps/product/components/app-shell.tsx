"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { getSession, signOutManager } from "@/lib/store";
import { useGuestly } from "./use-guestly";
import { Button } from "./ui";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/feedback", label: "Feedback", icon: Inbox },
  { href: "/dashboard/locations", label: "Locations", icon: MapPin },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function LogoMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="guestly-logo-mark grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white">
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
      <span className="text-base font-semibold tracking-tight text-zinc-950">Guestly</span>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useGuestly();

  function logout() {
    signOutManager();
    router.replace("/login");
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-zinc-950/20 backdrop-blur-sm transition md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-zinc-50/96 px-4 py-4 transition-smooth md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose}>
            <LogoMark />
          </Link>
          <button className="button-ghost md:hidden" type="button" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-zinc-950 text-zinc-50" : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mono-label">Workspace</p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">{state?.organization.name || "Guestly Demo Workspace"}</p>
          <p className="mt-1 text-xs text-zinc-500">Active, secured session</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const state = useGuestly();
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/90 bg-white/82 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between gap-4">
        <button className="button-ghost md:hidden" type="button" onClick={onMenu} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-zinc-950">{state?.organization.name}</p>
          <p className="text-xs text-zinc-500">Live intelligence workspace</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-zinc-950">{state?.user.name}</p>
            <p className="text-xs text-zinc-500">{state?.user.role}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-950 transition-smooth hover:border-zinc-300 hover:bg-white">
            BG
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="panel rounded-xl p-6 text-sm text-zinc-500">Preparing Guestly workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem_1fr]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="page-flow px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
