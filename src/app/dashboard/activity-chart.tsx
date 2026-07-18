"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

export type WeekBucket = { weekLabel: string; count: number };

function ActivityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WeekBucket }[];
}) {
  if (!active || !payload?.length) return null;
  const bucket = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Week of {bucket.weekLabel}</p>
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
        {bucket.count} completed
      </p>
    </div>
  );
}

export function ActivityChart({ data }: { data: WeekBucket[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Assessments completed per week
      </h3>
      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth={1} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip content={<ActivityTooltip />} cursor={{ fill: "currentColor", className: "text-zinc-100 dark:text-zinc-800" }} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
