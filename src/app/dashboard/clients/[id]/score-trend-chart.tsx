"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

export type TrendPoint = {
  date: string;
  score: number;
  severityLabel: string | null;
  severityColor: string;
};

type BandLegendEntry = { label: string; color: string };

function TrendDot(props: { cx?: number; cy?: number; payload?: TrendPoint }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={payload.severityColor}
      stroke="currentColor"
      strokeWidth={2}
      className="text-white dark:text-zinc-900"
    />
  );
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {new Date(point.date).toLocaleDateString()}
      </p>
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
        Score: {point.score}
        {point.severityLabel && (
          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
            ({point.severityLabel})
          </span>
        )}
      </p>
    </div>
  );
}

export function ScoreTrendChart({
  templateTitle,
  points,
  bandLegend,
}: {
  templateTitle: string;
  points: TrendPoint[];
  bandLegend: BandLegendEntry[];
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{templateTitle}</h3>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth={1} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-500"
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<TrendTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2}
              dot={<TrendDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {bandLegend.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {bandLegend.map((band) => (
            <div key={band.label} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              {band.label}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
