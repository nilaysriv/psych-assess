"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card } from "@/components/ui/card";

export type SeverityBucket = { label: string; count: number; color: string };

function DistributionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SeverityBucket }[];
}) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
        {bucket.count} client{bucket.count === 1 ? "" : "s"}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{bucket.label}</p>
    </div>
  );
}

export function SeverityDistributionChart({ data }: { data: SeverityBucket[] }) {
  if (data.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Clients by current severity
        </h3>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          No scored assessments completed yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Clients by current severity
      </h3>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        Based on each client&apos;s most recent scored assessment
      </p>
      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth={1} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-zinc-500 dark:text-zinc-400"
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<DistributionTooltip />} cursor={{ fill: "currentColor", className: "text-zinc-100 dark:text-zinc-800" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((bucket) => (
                <Cell key={bucket.label} fill={bucket.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
