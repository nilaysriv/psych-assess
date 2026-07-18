import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { ClientDetailHeader } from "./client-detail-header";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const client = await prisma.client.findFirst({ where: { id, ownerId: userId } });
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
      />

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Assessment history
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sent assessments and score trends will appear here once you send this client an
          assessment.
        </p>
      </Card>
    </div>
  );
}
