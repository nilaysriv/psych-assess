import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { SeverityBand, findSeverityBand } from "@/lib/scoring";
import { severityHex } from "@/lib/severity-colors";
import { ClientDetailHeader } from "./client-detail-header";
import { InstanceList } from "./instance-list";
import { ScoreTrendChart, TrendPoint } from "./score-trend-chart";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const [client, templates, instances] = await Promise.all([
    prisma.client.findFirst({ where: { id, ownerId: userId } }),
    prisma.assessmentTemplate.findMany({
      where: { ownerId: userId },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.assessmentInstance.findMany({
      where: { clientId: id, template: { ownerId: userId } },
      orderBy: { sentAt: "desc" },
      include: {
        template: { select: { title: true, scoringRule: { select: { severityBands: true } } } },
        response: { select: { totalScore: true, severityLabel: true } },
      },
    }),
  ]);

  if (!client) notFound();

  // Group completed, scored instances by template to build one trend chart
  // per assessment type the client has taken 2+ times (PRD 5.6).
  const byTemplate = new Map<
    string,
    { title: string; bands: SeverityBand[]; points: TrendPoint[] }
  >();

  for (const instance of instances) {
    if (instance.status !== "completed" || instance.response?.totalScore == null) continue;
    const bands = (instance.template.scoringRule?.severityBands as unknown as SeverityBand[]) ?? [];
    const entry = byTemplate.get(instance.templateId) ?? {
      title: instance.template.title,
      bands,
      points: [],
    };
    entry.points.push({
      date: (instance.completedAt ?? instance.sentAt).toISOString(),
      score: instance.response.totalScore,
      severityLabel: instance.response.severityLabel,
      severityColor: severityHex(findSeverityBand(instance.response.totalScore, bands)?.color),
    });
    byTemplate.set(instance.templateId, entry);
  }

  const trendCharts = Array.from(byTemplate.values())
    .filter((entry) => entry.points.length >= 2)
    .map((entry) => ({
      ...entry,
      points: entry.points.sort((a, b) => a.date.localeCompare(b.date)),
      bandLegend: entry.bands
        .filter((b) => b.label)
        .map((b) => ({ label: b.label, color: severityHex(b.color) })),
    }));

  return (
    <div>
      <Link
        href="/dashboard/clients"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← All clients
      </Link>

      <ClientDetailHeader
        client={{
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          notes: client.notes,
          archivedAt: client.archivedAt ? client.archivedAt.toISOString() : null,
        }}
        templates={templates}
      />

      {trendCharts.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {trendCharts.map((chart) => (
            <ScoreTrendChart
              key={chart.title}
              templateTitle={chart.title}
              points={chart.points}
              bandLegend={chart.bandLegend}
            />
          ))}
        </div>
      )}

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Assessment history
        </h2>
        <InstanceList
          clientId={client.id}
          instances={instances.map((i) => ({
            id: i.id,
            templateTitle: i.template.title,
            status: i.status,
            sentAt: i.sentAt.toISOString(),
            completedAt: i.completedAt ? i.completedAt.toISOString() : null,
            expiresAt: i.expiresAt.toISOString(),
            totalScore: i.response?.totalScore ?? null,
            severityLabel: i.response?.severityLabel ?? null,
          }))}
        />
      </Card>
    </div>
  );
}
