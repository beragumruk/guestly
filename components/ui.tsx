"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Search } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel motion-panel rounded-xl ${className}`}>{children}</section>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const variants = {
    primary: "button-primary",
    secondary: "button-secondary",
    ghost: "button-ghost",
  };
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field-input" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="field-input min-h-32 resize-y" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="field-input" {...props} />;
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card className="stat-card p-5">
      <p className="mono-label">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mono-label">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em] text-zinc-950 md:text-4xl">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function FilterBar({
  search,
  onSearch,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="animate-rise flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white/90 p-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
          placeholder="Search feedback, guest, location, or AI summary"
        />
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function SegmentedTabs({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            value === option.value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
