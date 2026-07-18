import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SeverityBand, findSeverityBand } from "@/lib/scoring";
import { severityHex } from "@/lib/severity-colors";
import { StatTile } from "./stat-tile";
import { ActivityChart, WeekBucket } from "./activity-chart";
import { SeverityDistributionChart, SeverityBucket } from "./severity-distribution-chart";
import { ClientSummaryTable, ClientSummaryRow } from "./client-summary-table";
import { DashboardRefresh } from "./dashboard-refresh";

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function DashboardPage() {
  const userId = await requireUserId();

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const weekStarts: Date[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() - (7 - i) * 7);
    return d;
  });
  const rangeStart = weekStarts[0];

  const [totalClients, pendingCount, recentResponses, clients] = await Promise.all([
    prisma.client.count({ where: { ownerId: userId, archivedAt: null } }),
    prisma.assessmentInstance.count({
      where: {
        status: "pending",
        expiresAt: { gt: now },
        template: { ownerId: userId },
      },
    }),
    prisma.response.findMany({
      where: {
        submittedAt: { gte: rangeStart },
        instance: { template: { ownerId: userId } },
      },
      select: { submittedAt: true },
    }),
    prisma.client.findMany({
      where: { ownerId: userId, archivedAt: null },
      orderBy: { name: "asc" },
      include: {
        instances: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 1,
          include: {
            template: {
              select: { title: true, scoringRule: { select: { severityBands: true } } },
            },
            response: { select: { totalScore: true, severityLabel: true } },
          },
        },
      },
    }),
  ]);

  const counts = new Map<string, number>(weekStarts.map((w) => [w.toISOString(), 0]));
  for (const r of recentResponses) {
    const key = startOfWeek(r.submittedAt).toISOString();
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const activityData: WeekBucket[] = weekStarts.map((w) => ({
    weekLabel: w.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: counts.get(w.toISOString()) ?? 0,
  }));
  const completedThisWeek = counts.get(thisWeekStart.toISOString()) ?? 0;

  const clientRows: ClientSummaryRow[] = clients.map((client) => {
    const instance = client.instances[0];
    const bands = (instance?.template.scoringRule?.severityBands as unknown as SeverityBand[]) ?? [];
    const score = instance?.response?.totalScore ?? null;
    const band = score !== null ? findSeverityBand(score, bands) : null;
    return {
      id: client.id,
      name: client.name,
      lastTemplateTitle: instance?.template.title ?? null,
      lastScore: score,
      lastSeverityLabel: instance?.response?.severityLabel ?? null,
      lastSeverityTone: (band?.color as ClientSummaryRow["lastSeverityTone"]) ?? null,
      lastCompletedAt: instance?.completedAt ? instance.completedAt.toISOString() : null,
    };
  });

  const elevatedCount = clientRows.filter((r) => r.lastSeverityTone === "red").length;

  const distributionMap = new Map<string, SeverityBucket>();
  for (const row of clientRows) {
    if (!row.lastSeverityLabel || row.lastScore === null) continue;
    const key = row.lastSeverityLabel;
    const existing = distributionMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      distributionMap.set(key, {
        label: key,
        count: 1,
        color: severityHex(row.lastSeverityTone ?? undefined),
      });
    }
  }
  const distributionData = Array.from(distributionMap.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <DashboardRefresh />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Active clients" value={totalClients} />
        <StatTile label="Awaiting response" value={pendingCount} />
        <StatTile label="Completed this week" value={completedThisWeek} />
        <StatTile
          label="Currently in a severe band"
          value={elevatedCount}
          tone={elevatedCount > 0 ? "critical" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityChart data={activityData} />
        <SeverityDistributionChart data={distributionData} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Client activity
        </h2>
        <ClientSummaryTable rows={clientRows} />
      </div>
    </div>
  );
}
