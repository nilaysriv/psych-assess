import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuestionConfig } from "@/lib/question-types";
import { TemplateBuilder } from "../template-builder";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const template = await prisma.assessmentTemplate.findFirst({
    where: { id, ownerId: userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!template) notFound();

  return (
    <TemplateBuilder
      initial={{
        id: template.id,
        title: template.title,
        description: template.description ?? "",
        questions: template.questions.map((q) => ({
          key: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          subscale: q.subscale ?? "",
          config: q.config as unknown as QuestionConfig,
        })),
      }}
    />
  );
}
