import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InstanceStatus } from "@/generated/prisma/enums";
import { AwaitingResponseList } from "./awaiting-response-list";

export default async function AwaitingResponsePage() {
  const userId = await requireUserId();

  const instances = await prisma.assessmentInstance.findMany({
    where: { status: InstanceStatus.pending, template: { ownerId: userId } },
    orderBy: { sentAt: "asc" },
    include: {
      client: { select: { id: true, name: true } },
      template: { select: { title: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Awaiting Response</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Assessments you've sent that clients haven't completed yet.
        </p>
      </div>

      <AwaitingResponseList
        instances={instances.map((i) => ({
          id: i.id,
          clientId: i.client.id,
          clientName: i.client.name,
          templateTitle: i.template.title,
          sentAt: i.sentAt.toISOString(),
          expiresAt: i.expiresAt.toISOString(),
        }))}
      />
    </div>
  );
}
