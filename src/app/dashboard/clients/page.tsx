import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClientList } from "./client-list";

export default async function ClientsPage() {
  const userId = await requireUserId();

  const [clients, templates] = await Promise.all([
    prisma.client.findMany({
      where: { ownerId: userId },
      orderBy: { name: "asc" },
      include: {
        instances: {
          orderBy: { sentAt: "desc" },
          take: 1,
          select: { sentAt: true, status: true },
        },
      },
    }),
    prisma.assessmentTemplate.findMany({
      where: { ownerId: userId },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <ClientList
      templates={templates}
      clients={clients.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        archivedAt: c.archivedAt ? c.archivedAt.toISOString() : null,
        lastAssessment: c.instances[0]
          ? { sentAt: c.instances[0].sentAt.toISOString(), status: c.instances[0].status }
          : null,
      }))}
    />
  );
}
