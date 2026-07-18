import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "critical";
}) {
  return (
    <Card className="p-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "critical"
            ? "text-red-600 dark:text-red-400"
            : "text-zinc-900 dark:text-zinc-50",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
