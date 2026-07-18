"use server";

import { prisma } from "@/lib/db";
import { InstanceStatus, effectiveStatus } from "@/lib/instance-status";
import type { Prisma } from "@/generated/prisma/client";

function isAnswerMissing(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export async function submitAssessment(
  token: string,
  answers: Record<string, unknown>,
): Promise<void> {
  const instance = await prisma.assessmentInstance.findUnique({
    where: { token },
    include: { template: { include: { questions: true } } },
  });

  if (!instance) {
    throw new Error("This link is invalid.");
  }

  const status = effectiveStatus(instance.status, instance.expiresAt);
  if (status !== InstanceStatus.pending) {
    throw new Error("This link is no longer active.");
  }

  for (const question of instance.template.questions) {
    if (question.required && isAnswerMissing(answers[question.id])) {
      throw new Error("Please answer all required questions.");
    }
  }

  // Only persist answers for questions that actually belong to this template.
  const questionIds = new Set(instance.template.questions.map((q) => q.id));
  const rawAnswers: Record<string, unknown> = {};
  for (const [id, value] of Object.entries(answers)) {
    if (questionIds.has(id)) rawAnswers[id] = value;
  }

  await prisma.$transaction([
    prisma.response.create({
      data: {
        instanceId: instance.id,
        rawAnswers: rawAnswers as unknown as Prisma.InputJsonValue,
        // TODO(scoring engine): compute totalScore/subscaleScores/severityLabel here.
      },
    }),
    prisma.assessmentInstance.update({
      where: { id: instance.id },
      data: { status: InstanceStatus.completed, completedAt: new Date() },
    }),
  ]);
}
