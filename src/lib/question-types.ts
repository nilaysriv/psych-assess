import { QuestionType } from "@/generated/prisma/enums";

export { QuestionType };

export type ChoiceOption = {
  id: string;
  label: string;
};

export type ChoiceConfig = {
  choices: ChoiceOption[];
};

export type LikertConfig = {
  scalePoints: number;
  minLabel: string;
  maxLabel: string;
};

export type NumericConfig = {
  min: number;
  max: number;
  step: number;
};

export type TextConfig = Record<string, never>;

export type QuestionConfig = ChoiceConfig | LikertConfig | NumericConfig | TextConfig;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Single choice",
  multi_choice: "Multiple choice",
  likert: "Likert scale",
  numeric: "Number",
  short_text: "Short text",
  long_text: "Long text (paragraph)",
};

export const QUESTION_TYPE_OPTIONS = Object.values(QuestionType);

export function isChoiceType(type: QuestionType): boolean {
  return type === QuestionType.single_choice || type === QuestionType.multi_choice;
}

function newChoiceId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function defaultConfigFor(type: QuestionType): QuestionConfig {
  switch (type) {
    case QuestionType.single_choice:
    case QuestionType.multi_choice:
      return {
        choices: [
          { id: newChoiceId(), label: "" },
          { id: newChoiceId(), label: "" },
        ],
      };
    case QuestionType.likert:
      return { scalePoints: 5, minLabel: "", maxLabel: "" };
    case QuestionType.numeric:
      return { min: 0, max: 10, step: 1 };
    case QuestionType.short_text:
    case QuestionType.long_text:
      return {};
  }
}

export function newChoiceOption(): ChoiceOption {
  return { id: newChoiceId(), label: "" };
}
