"use client";

import {
  ChoiceConfig,
  LikertConfig,
  NumericConfig,
  QuestionConfig,
  QuestionType,
} from "@/lib/question-types";
import { fieldClass } from "@/components/ui/field";

export type RenderableQuestion = {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  config: QuestionConfig;
};

type Props = {
  question: RenderableQuestion;
  value?: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
};

const fieldName = (id: string) => `question-${id}`;
const radioClass = "h-4 w-4 accent-indigo-600";
const optionRowClass =
  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60";

export function QuestionRenderer({ question, value, onChange, readOnly = false }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {question.text || <span className="text-zinc-400 dark:text-zinc-500">Untitled question</span>}
        {question.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <QuestionInput question={question} value={value} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}

function QuestionInput({ question, value, onChange, readOnly }: Props) {
  switch (question.type) {
    case QuestionType.single_choice: {
      const { choices } = question.config as ChoiceConfig;
      return (
        <div className="space-y-1">
          {choices.map((choice) => (
            <label key={choice.id} className={optionRowClass}>
              <input
                type="radio"
                name={fieldName(question.id)}
                value={choice.id}
                checked={value === choice.id}
                disabled={readOnly}
                onChange={() => onChange?.(choice.id)}
                className={radioClass}
              />
              {choice.label || <span className="text-zinc-400 dark:text-zinc-500">(empty option)</span>}
            </label>
          ))}
        </div>
      );
    }

    case QuestionType.multi_choice: {
      const { choices } = question.config as ChoiceConfig;
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-1">
          {choices.map((choice) => (
            <label key={choice.id} className={optionRowClass}>
              <input
                type="checkbox"
                value={choice.id}
                checked={selected.includes(choice.id)}
                disabled={readOnly}
                onChange={(e) => {
                  if (!onChange) return;
                  onChange(
                    e.target.checked
                      ? [...selected, choice.id]
                      : selected.filter((id) => id !== choice.id),
                  );
                }}
                className="h-4 w-4 rounded accent-indigo-600"
              />
              {choice.label || <span className="text-zinc-400 dark:text-zinc-500">(empty option)</span>}
            </label>
          ))}
        </div>
      );
    }

    case QuestionType.likert: {
      const { scalePoints, minLabel, maxLabel } = question.config as LikertConfig;
      const points = Array.from({ length: scalePoints }, (_, i) => i + 1);
      return (
        <div>
          <div className="flex items-center justify-between gap-2">
            {points.map((point) => (
              <label
                key={point}
                className="flex flex-col items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <input
                  type="radio"
                  name={fieldName(question.id)}
                  value={point}
                  checked={value === point}
                  disabled={readOnly}
                  onChange={() => onChange?.(point)}
                  className={radioClass}
                />
                {point}
              </label>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>{minLabel || " "}</span>
            <span>{maxLabel || " "}</span>
          </div>
        </div>
      );
    }

    case QuestionType.numeric: {
      const { min, max, step } = question.config as NumericConfig;
      const current = typeof value === "number" ? value : min;
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            disabled={readOnly}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="w-10 text-right text-sm text-zinc-700 dark:text-zinc-300">{current}</span>
        </div>
      );
    }

    case QuestionType.short_text:
      return (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={fieldClass}
        />
      );

    case QuestionType.long_text:
      return (
        <textarea
          value={typeof value === "string" ? value : ""}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          rows={4}
          className={fieldClass}
        />
      );

    default:
      return null;
  }
}
