import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { InstanceStatus, effectiveStatus } from "@/lib/instance-status";
import { QuestionConfig } from "@/lib/question-types";
import { Card } from "@/components/ui/card";
import { AssessmentForm } from "./assessment-form";

export const metadata: Metadata = {
  title: "Assessment",
  robots: { index: false, follow: false },
};

function StatusScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-sm p-8 text-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{body}</p>
      </Card>
    </div>
  );
}

export default async function PublicAssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const instance = await prisma.assessmentInstance.findUnique({
    where: { token },
    include: {
      template: {
        include: { questions: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!instance) {
    return (
      <StatusScreen
        title="Link not found"
        body="This assessment link doesn't exist. Double-check the link your clinician sent you."
      />
    );
  }

  const status = effectiveStatus(instance.status, instance.expiresAt);

  if (status === InstanceStatus.completed) {
    return (
      <StatusScreen
        title="Already completed"
        body="This assessment has already been submitted. Thank you."
      />
    );
  }

  if (status === InstanceStatus.cancelled) {
    return (
      <StatusScreen
        title="Link cancelled"
        body="This assessment link is no longer active. Contact your clinician if you think this is a mistake."
      />
    );
  }

  if (status === InstanceStatus.expired) {
    return (
      <StatusScreen
        title="Link expired"
        body="This assessment link has expired. Please ask your clinician to send you a new one."
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AssessmentForm
        token={token}
        title={instance.template.title}
        description={instance.template.description}
        questions={instance.template.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          config: q.config as unknown as QuestionConfig,
        }))}
      />
    </div>
  );
}
