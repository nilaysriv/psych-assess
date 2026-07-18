import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ClientSummaryRow = {
  id: string;
  name: string;
  lastTemplateTitle: string | null;
  lastScore: number | null;
  lastSeverityLabel: string | null;
  lastSeverityTone: "green" | "amber" | "red" | "blue" | "neutral" | null;
  lastCompletedAt: string | null;
};

export function ClientSummaryTable({ rows }: { rows: ClientSummaryRow[] }) {
  if (rows.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Add a client to see their assessment activity here.
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Last assessment</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Completed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/clients/${row.id}`}
                  className="font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {row.lastTemplateTitle ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
              </td>
              <td className="px-4 py-3">
                {row.lastScore !== null ? (
                  <Badge tone={row.lastSeverityTone ?? "neutral"}>
                    {row.lastScore}
                    {row.lastSeverityLabel ? ` · ${row.lastSeverityLabel}` : ""}
                  </Badge>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {row.lastCompletedAt
                  ? new Date(row.lastCompletedAt).toLocaleDateString()
                  : <span className="text-zinc-400 dark:text-zinc-600">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
