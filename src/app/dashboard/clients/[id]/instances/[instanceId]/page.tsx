import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuestionConfig } from "@/lib/question-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionRenderer } from "@/components/question-renderer";

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; instanceId: string }>;
}) {
  const { id, instanceId } = await params;
  const userId = await requireUserId();

  const instance = await prisma.assessmentInstance.findFirst({
    where: { id: instanceId, clientId: id, template: { ownerId: userId } },
    include: {
      client: { select: { name: true } },
      template: { include: { questions: { orderBy: { order: "asc" } } } },
      response: true,
    },
  });

  if (!instance || !instance.response) notFound();

  const rawAnswers = instance.response.rawAnswers as Record<string, unknown>;
  const subscaleScores = (instance.response.subscaleScores as Record<string, number> | null) ?? {};

  return (
    <div>
      <Link
        href={`/dashboard/clients/${id}`}
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← {instance.client.name}
      </Link>

      <Card className="p-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {instance.template.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Completed {instance.completedAt?.toLocaleDateString()}
        </p>

        {instance.response.totalScore !== null && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="indigo">Total score: {instance.response.totalScore}</Badge>
            {instance.response.severityLabel && (
              <Badge tone="neutral">{instance.response.severityLabel}</Badge>
            )}
            {Object.entries(subscaleScores).map(([name, score]) => (
              <Badge key={name} tone="blue">
                {name}: {score}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 space-y-4">
        {instance.template.questions.map((question) => (
          <Card key={question.id} className="p-5">
            <QuestionRenderer
              question={{
                id: question.id,
                text: question.text,
                type: question.type,
                required: question.required,
                config: question.config as unknown as QuestionConfig,
              }}
              value={rawAnswers[question.id]}
              readOnly
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
