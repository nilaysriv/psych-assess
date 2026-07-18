"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { QuestionType, defaultConfigFor } from "@/lib/question-types";
import { SeverityBand } from "@/lib/scoring";
import { QuestionRenderer } from "@/components/question-renderer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { QuestionCard, BuilderQuestion } from "./question-card";
import { SeverityBandsEditor } from "./severity-bands-editor";
import { saveTemplate } from "./actions";

let nextKey = 0;
function newKey() {
  nextKey += 1;
  return `new-${Date.now()}-${nextKey}`;
}

export type InitialTemplate = {
  id?: string;
  title: string;
  description: string;
  hasScoring: boolean;
  severityBands: SeverityBand[];
  questions: BuilderQuestion[];
};

export function TemplateBuilder({ initial }: { initial: InitialTemplate }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [hasScoring, setHasScoring] = useState(initial.hasScoring);
  const [severityBands, setSeverityBands] = useState<SeverityBand[]>(initial.severityBands);
  const [questions, setQuestions] = useState<BuilderQuestion[]>(initial.questions);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function markDirty() {
    setSavedAt(null);
  }

  function addQuestion() {
    setQuestions((qs) => [
      ...qs,
      {
        key: newKey(),
        text: "",
        type: QuestionType.short_text,
        required: true,
        subscale: "",
        config: defaultConfigFor(QuestionType.short_text),
      },
    ]);
    markDirty();
  }

  function updateQuestion(key: string, patch: Partial<BuilderQuestion>) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
    markDirty();
  }

  function removeQuestion(key: string) {
    setQuestions((qs) => qs.filter((q) => q.key !== key));
    markDirty();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setQuestions((qs) => {
      const oldIndex = qs.findIndex((q) => q.key === active.id);
      const newIndex = qs.findIndex((q) => q.key === over.id);
      return arrayMove(qs, oldIndex, newIndex);
    });
    markDirty();
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await saveTemplate({
          id: initial.id,
          title,
          description,
          hasScoring,
          severityBands,
          questions: questions.map((q) => ({
            text: q.text,
            type: q.type,
            required: q.required,
            subscale: q.subscale,
            config: q.config,
          })),
        });
        setSavedAt(new Date());
        if (!initial.id) {
          router.replace(`/dashboard/templates/${id}`);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save this assessment.");
      }
    });
  }

  return (
    <div>
      <div className="sticky top-[73px] z-[5] -mx-4 mb-6 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
            placeholder="Assessment name"
            className="max-w-sm text-base font-medium"
          />
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
            {!error && savedAt && (
              <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
            )}
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-4 sm:p-5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
              rows={2}
              placeholder="Shown to clients above the questions"
            />
          </Card>

          <Card className="p-4 sm:p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <input
                type="checkbox"
                checked={hasScoring}
                onChange={(e) => {
                  setHasScoring(e.target.checked);
                  markDirty();
                }}
                className="h-4 w-4 rounded accent-indigo-600"
              />
              Score this assessment
            </label>
            <p className="mt-1 pl-6 text-xs text-zinc-500 dark:text-zinc-400">
              Assign point values to choice options, group questions into subscales, and define
              severity bands. Free-text questions are never scored.
            </p>

            {hasScoring && (
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Severity bands
                </p>
                <SeverityBandsEditor
                  bands={severityBands}
                  onChange={(bands) => {
                    setSeverityBands(bands);
                    markDirty();
                  }}
                />
              </div>
            )}
          </Card>

          <DndContext
            id="template-questions"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map((q) => q.key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCard
                    key={q.key}
                    question={q}
                    index={i}
                    scoringEnabled={hasScoring}
                    onChange={(patch) => updateQuestion(q.key, patch)}
                    onRemove={() => removeQuestion(q.key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {questions.length === 0 && (
            <Card className="border-dashed p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No questions yet.
            </Card>
          )}

          <Button variant="secondary" onClick={addQuestion} className="w-full">
            + Add question
          </Button>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Preview
          </p>
          <Card className="sticky top-[150px] p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {title || "Untitled assessment"}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
            <div className="mt-6 space-y-6">
              {questions.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Add a question to see it here.
                </p>
              )}
              {questions.map((q) => (
                <QuestionRenderer
                  key={q.key}
                  question={{ id: q.key, text: q.text, type: q.type, required: q.required, config: q.config }}
                  readOnly
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
