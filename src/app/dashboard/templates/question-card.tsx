"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChoiceConfig,
  LikertConfig,
  NumericConfig,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_OPTIONS,
  QuestionConfig,
  QuestionType,
  defaultConfigFor,
  isChoiceType,
  newChoiceOption,
} from "@/lib/question-types";
import { isScorableType } from "@/lib/scoring";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type BuilderQuestion = {
  key: string;
  text: string;
  type: QuestionType;
  required: boolean;
  subscale: string;
  config: QuestionConfig;
};

type Props = {
  question: BuilderQuestion;
  index: number;
  scoringEnabled: boolean;
  onChange: (patch: Partial<BuilderQuestion>) => void;
  onRemove: () => void;
};

export function QuestionCard({ question, index, scoringEnabled, onChange, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("p-4 sm:p-5", isDragging && "opacity-60 shadow-lg")}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="mt-1 flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-zinc-800"
          {...attributes}
          {...listeners}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="2" r="1.3" />
            <circle cx="10" cy="2" r="1.3" />
            <circle cx="4" cy="7" r="1.3" />
            <circle cx="10" cy="7" r="1.3" />
            <circle cx="4" cy="12" r="1.3" />
            <circle cx="10" cy="12" r="1.3" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <span className="mt-2.5 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {index + 1}.
            </span>
            <Input
              value={question.text}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Question text"
              className="min-w-0 flex-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pl-5">
            <Select
              value={question.type}
              onChange={(e) => {
                const type = e.target.value as QuestionType;
                onChange({ type, config: defaultConfigFor(type) });
              }}
              className="w-auto"
            >
              {QUESTION_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>

            <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onChange({ required: e.target.checked })}
                className="h-4 w-4 rounded accent-indigo-600"
              />
              Required
            </label>

            {scoringEnabled && isScorableType(question.type) && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Subscale</span>
                <Input
                  value={question.subscale}
                  onChange={(e) => onChange({ subscale: e.target.value })}
                  placeholder="optional"
                  className="w-32"
                />
              </div>
            )}
          </div>

          <div className="pl-5">
            <QuestionConfigEditor question={question} scoringEnabled={scoringEnabled} onChange={onChange} />
          </div>
        </div>

        <button
          type="button"
          aria-label="Delete question"
          onClick={onRemove}
          className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 4h10M6.5 4V2.5h3V4M4.5 4l.5 9.5h6l.5-9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

type ConfigEditorProps = Pick<Props, "question" | "scoringEnabled" | "onChange">;

function QuestionConfigEditor({ question, scoringEnabled, onChange }: ConfigEditorProps) {
  if (isChoiceType(question.type)) {
    const { choices } = question.config as ChoiceConfig;
    const updateChoices = (next: typeof choices) => onChange({ config: { choices: next } });

    return (
      <div className="space-y-2">
        {choices.map((choice, i) => (
          <div key={choice.id} className="flex items-center gap-2">
            <span className="w-4 text-xs text-zinc-400">{i + 1}.</span>
            <Input
              value={choice.label}
              onChange={(e) =>
                updateChoices(
                  choices.map((c) => (c.id === choice.id ? { ...c, label: e.target.value } : c)),
                )
              }
              placeholder={`Option ${i + 1}`}
              className="min-w-0 flex-1"
            />
            {scoringEnabled && (
              <Input
                type="number"
                value={choice.points ?? ""}
                onChange={(e) =>
                  updateChoices(
                    choices.map((c) =>
                      c.id === choice.id
                        ? {
                            ...c,
                            points: e.target.value === "" ? undefined : Number(e.target.value),
                          }
                        : c,
                    ),
                  )
                }
                placeholder="pts"
                title="Points awarded for this option"
                className="w-16 shrink-0"
              />
            )}
            <button
              type="button"
              aria-label="Remove option"
              disabled={choices.length <= 1}
              onClick={() => updateChoices(choices.filter((c) => c.id !== choice.id))}
              className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:text-zinc-500 dark:hover:bg-red-500/10"
            >
              ✕
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => updateChoices([...choices, newChoiceOption()])}
        >
          + Add option
        </Button>
      </div>
    );
  }

  if (question.type === QuestionType.likert) {
    const { scalePoints, minLabel, maxLabel } = question.config as LikertConfig;
    return (
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Scale points</span>
          <Select
            value={scalePoints}
            onChange={(e) =>
              onChange({
                config: { scalePoints: Number(e.target.value), minLabel, maxLabel } as LikertConfig,
              })
            }
            className="w-20"
          >
            {[3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Low end label</span>
          <Input
            value={minLabel}
            onChange={(e) =>
              onChange({ config: { scalePoints, minLabel: e.target.value, maxLabel } as LikertConfig })
            }
            placeholder="e.g. Not at all"
            className="w-40"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">High end label</span>
          <Input
            value={maxLabel}
            onChange={(e) =>
              onChange({ config: { scalePoints, minLabel, maxLabel: e.target.value } as LikertConfig })
            }
            placeholder="e.g. Nearly every day"
            className="w-40"
          />
        </div>
        {scoringEnabled && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Scored automatically using the selected number (1–{scalePoints}).
          </p>
        )}
      </div>
    );
  }

  if (question.type === QuestionType.numeric) {
    const { min, max, step } = question.config as NumericConfig;
    return (
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Min</span>
          <Input
            type="number"
            value={min}
            onChange={(e) => onChange({ config: { min: Number(e.target.value), max, step } })}
            className="w-20"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Max</span>
          <Input
            type="number"
            value={max}
            onChange={(e) => onChange({ config: { min, max: Number(e.target.value), step } })}
            className="w-20"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Step</span>
          <Input
            type="number"
            value={step}
            onChange={(e) => onChange({ config: { min, max, step: Number(e.target.value) } })}
            className="w-20"
          />
        </div>
        {scoringEnabled && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Scored using the entered value.</p>
        )}
      </div>
    );
  }

  if (question.type === QuestionType.long_text) {
    return <Textarea disabled placeholder="Client will type a longer answer here" rows={2} />;
  }

  return null;
}
