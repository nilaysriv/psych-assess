"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { QuestionConfig, QuestionType } from "@/lib/question-types";
import type { Prisma } from "@/generated/prisma/client";

export type QuestionInput = {
  text: string;
  type: QuestionType;
  required: boolean;
  subscale?: string | null;
  config: QuestionConfig;
};

export type SaveTemplateInput = {
  id?: string;
  title: string;
  description?: string;
  questions: QuestionInput[];
};

export async function saveTemplate(input: SaveTemplateInput): Promise<{ id: string }> {
  const userId = await requireUserId();

  const title = input.title.trim();
  if (!title) {
    throw new Error("Give the assessment a name before saving.");
  }

  const templateId = await prisma.$transaction(async (tx) => {
    let id = input.id;

    if (id) {
      const existing = await tx.assessmentTemplate.findFirst({ where: { id, ownerId: userId } });
      if (!existing) throw new Error("Template not found.");
      await tx.assessmentTemplate.update({
        where: { id },
        data: { title, description: input.description?.trim() || null },
      });
    } else {
      const created = await tx.assessmentTemplate.create({
        data: { ownerId: userId, title, description: input.description?.trim() || null },
      });
      id = created.id;
    }

    await tx.question.deleteMany({ where: { templateId: id } });
    if (input.questions.length > 0) {
      await tx.question.createMany({
        data: input.questions.map((q, index) => ({
          templateId: id!,
          order: index,
          text: q.text.trim(),
          type: q.type,
          required: q.required,
          subscale: q.subscale?.trim() || null,
          config: q.config as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    return id;
  });

  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${templateId}`);
  return { id: templateId };
}

export async function deleteTemplate(id: string): Promise<void> {
  const userId = await requireUserId();

  const template = await prisma.assessmentTemplate.findFirst({ where: { id, ownerId: userId } });
  if (!template) throw new Error("Template not found.");

  const sentCount = await prisma.assessmentInstance.count({ where: { templateId: id } });
  if (sentCount > 0) {
    throw new Error(
      "This assessment has already been sent to a client, so it can't be deleted (their responses depend on it).",
    );
  }

  await prisma.assessmentTemplate.delete({ where: { id } });
  revalidatePath("/dashboard/templates");
}

export async function duplicateTemplate(id: string): Promise<{ id: string }> {
  const userId = await requireUserId();

  const source = await prisma.assessmentTemplate.findFirst({
    where: { id, ownerId: userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!source) throw new Error("Template not found.");

  // TODO(scoring engine): also copy source.scoringRule once ScoringRule exists.
  const copy = await prisma.assessmentTemplate.create({
    data: {
      ownerId: userId,
      title: `${source.title} (Copy)`,
      description: source.description,
      questions: {
        create: source.questions.map((q) => ({
          order: q.order,
          text: q.text,
          type: q.type,
          required: q.required,
          subscale: q.subscale,
          config: q.config as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath("/dashboard/templates");
  return { id: copy.id };
}
