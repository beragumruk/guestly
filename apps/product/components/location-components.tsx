"use client";

import { Copy, Download, ExternalLink, Power } from "lucide-react";
import { updateLocation } from "@/lib/store";
import type { FeedbackLocation } from "@/lib/types";
import { Button, Card } from "./ui";

const qrCells = new Set([
  0, 1, 2, 3, 5, 6, 7, 8, 10, 12, 14, 16, 18, 19, 20, 22, 24, 25, 26, 30, 31, 34, 36, 38, 40, 42, 44, 46, 48, 49, 50,
  54, 56, 58, 60, 61, 62, 64, 66, 68, 70, 72, 73, 74, 75, 77, 78, 79, 80,
]);

export function publicUrl(slug: string) {
  if (typeof window !== "undefined") return `${window.location.origin}/f/${slug}`;
  return `/f/${slug}`;
}

export function QRCodeCard({ url }: { url: string }) {
  function download() {
    const content = `Guestly feedback link\n${url}\n\nPrint this card with a QR code in production.`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "guestly-feedback-link.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-zinc-50">
      <div className="rounded-lg bg-zinc-50 p-3">
        <div className="grid grid-cols-9 gap-1">
          {Array.from({ length: 81 }).map((_, index) => (
            <span key={index} className={`aspect-square rounded-[3px] ${qrCells.has(index) ? "bg-zinc-950" : "bg-zinc-200"}`} />
          ))}
        </div>
      </div>
      <p className="mt-3 break-all font-mono text-[11px] leading-5 text-zinc-300">{url}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" className="min-h-9 px-2 text-xs" onClick={() => navigator.clipboard.writeText(url)}>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button variant="secondary" className="min-h-9 px-2 text-xs" onClick={download}>
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>
    </div>
  );
}

export function LocationCard({ location }: { location: FeedbackLocation }) {
  const url = publicUrl(location.publicSlug);
  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-[1fr_15rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mono-label">{location.locationType}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">{location.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">Reference {location.referenceCode}</p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${location.active ? "border-zinc-300 bg-white text-zinc-700" : "border-zinc-200 bg-zinc-50 text-zinc-400"}`}>
            {location.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="break-all font-mono text-xs leading-5 text-zinc-600">{url}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(url)}>
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <a className="button-secondary" href={`/f/${location.publicSlug}`} target="_blank">
            <ExternalLink className="h-4 w-4" />
            Open form
          </a>
          <Button variant="ghost" onClick={() => updateLocation(location.id, { active: !location.active })}>
            <Power className="h-4 w-4" />
            {location.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
      <QRCodeCard url={url} />
    </Card>
  );
}
