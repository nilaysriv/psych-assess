"use server";

import { prisma } from "@/lib/db";
import { InstanceStatus, effectiveStatus } from "@/lib/instance-status";
import { QuestionConfig } from "@/lib/question-types";
import { SeverityBand, computeScore, findSeverityBand } from "@/lib/scoring";
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
    include: {
      template: { include: { questions: true, scoringRule: true } },
    },
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

  let totalScore: number | null = null;
  let subscaleScores: Record<string, number> | null = null;
  let severityLabel: string | null = null;

  if (instance.template.hasScoring) {
    const result = computeScore(
      instance.template.questions.map((q) => ({
        id: q.id,
        type: q.type,
        config: q.config as unknown as QuestionConfig,
        subscale: q.subscale,
      })),
      rawAnswers,
    );
    totalScore = result.totalScore;
    subscaleScores = result.subscaleScores;

    const bands = (instance.template.scoringRule?.severityBands as unknown as SeverityBand[]) ?? [];
    severityLabel = findSeverityBand(totalScore, bands)?.label ?? null;
  }

  await prisma.$transaction([
    prisma.response.create({
      data: {
        instanceId: instance.id,
        rawAnswers: rawAnswers as unknown as Prisma.InputJsonValue,
        totalScore,
        subscaleScores: subscaleScores as unknown as Prisma.InputJsonValue,
        severityLabel,
      },
    }),
    prisma.assessmentInstance.update({
      where: { id: instance.id },
      data: { status: InstanceStatus.completed, completedAt: new Date() },
    }),
  ]);
}
