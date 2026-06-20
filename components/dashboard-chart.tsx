"use client";

import { pretty } from "@/lib/analytics";

export function BarList({
  data,
  total,
}: {
  data: { label: string; value: number }[];
  total?: number;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const denominator = total || data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-zinc-700">{pretty(item.label)}</span>
            <span className="font-mono text-xs text-zinc-500">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-950 transition-all duration-300"
              style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, opacity: 0.42 + item.value / denominator }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardChart({
  points,
}: {
  points: { label: string; value: number; priority?: string }[];
}) {
  const width = 640;
  const height = 220;
  const max = 5;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.value / max) * (height - 28) - 12;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <defs>
          <pattern id="chart-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgb(228 228 231)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#chart-grid)" />
        <path d={path} fill="none" stroke="rgb(24 24 27)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          const x = index * step;
          const y = height - (point.value / max) * (height - 28) - 12;
          return (
            <g key={`${point.label}-${index}`}>
              <circle cx={x} cy={y} r={point.priority === "critical" ? 6 : 4} fill="rgb(24 24 27)" />
              {index % 2 === 0 && (
                <text x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="rgb(113 113 122)">
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
