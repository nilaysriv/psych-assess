import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TemplateList } from "./template-list";

export default async function TemplatesPage() {
  const userId = await requireUserId();

  const templates = await prisma.assessmentTemplate.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { questions: true, instances: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Assessments</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Build and manage the assessment templates you send to clients.
          </p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button>New Assessment</Button>
        </Link>
      </div>

      <TemplateList
        templates={templates.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          hasScoring: t.hasScoring,
          questionCount: t._count.questions,
          sentCount: t._count.instances,
          updatedAt: t.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
