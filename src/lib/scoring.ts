import {
  ChoiceConfig,
  QuestionConfig,
  QuestionType,
  isChoiceType,
} from "@/lib/question-types";

export type SeverityBand = {
  min: number;
  max: number;
  label: string;
  color: string;
};

export type ScorableQuestion = {
  id: string;
  type: QuestionType;
  config: QuestionConfig;
  subscale: string | null;
};

export type ScoreResult = {
  totalScore: number;
  subscaleScores: Record<string, number>;
};

// Returns null when a question/answer combination isn't scorable (free
// text, an unpicked choice with no point value assigned, etc.) so callers
// can exclude it from totals rather than treating it as a zero.
function pointsForAnswer(question: ScorableQuestion, value: unknown): number | null {
  switch (question.type) {
    case QuestionType.single_choice: {
      const { choices } = question.config as ChoiceConfig;
      const choice = choices.find((c) => c.id === value);
      return typeof choice?.points === "number" ? choice.points : null;
    }
    case QuestionType.multi_choice: {
      if (!Array.isArray(value)) return null;
      const { choices } = question.config as ChoiceConfig;
      const selected = new Set(value);
      let sum = 0;
      let matched = false;
      for (const choice of choices) {
        if (selected.has(choice.id) && typeof choice.points === "number") {
          sum += choice.points;
          matched = true;
        }
      }
      return matched ? sum : null;
    }
    case QuestionType.likert:
    case QuestionType.numeric:
      return typeof value === "number" ? value : null;
    case QuestionType.short_text:
    case QuestionType.long_text:
    default:
      return null;
  }
}

export function computeScore(
  questions: ScorableQuestion[],
  answers: Record<string, unknown>,
): ScoreResult {
  let totalScore = 0;
  const subscaleScores: Record<string, number> = {};

  for (const question of questions) {
    const points = pointsForAnswer(question, answers[question.id]);
    if (points === null) continue;

    totalScore += points;
    if (question.subscale) {
      subscaleScores[question.subscale] = (subscaleScores[question.subscale] ?? 0) + points;
    }
  }

  return { totalScore, subscaleScores };
}

export function findSeverityBand(score: number, bands: SeverityBand[]): SeverityBand | null {
  return bands.find((band) => score >= band.min && score <= band.max) ?? null;
}

export function isScorableType(type: QuestionType): boolean {
  return isChoiceType(type) || type === QuestionType.likert || type === QuestionType.numeric;
}
