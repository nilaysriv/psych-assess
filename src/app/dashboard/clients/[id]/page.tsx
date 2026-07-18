import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ClientDetailHeader } from "./client-detail-header";
import { InstanceList } from "./instance-list";

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
        template: { select: { title: true } },
        response: { select: { totalScore: true, severityLabel: true } },
      },
    }),
  ]);

  if (!client) notFound();

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

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Assessment history
        </h2>
        <InstanceList
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
