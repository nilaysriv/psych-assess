"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionRenderer, RenderableQuestion } from "@/components/question-renderer";
import { submitAssessment } from "./actions";

type Props = {
  token: string;
  title: string;
  description: string | null;
  questions: RenderableQuestion[];
};

function isAnswerMissing(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function AssessmentForm({ token, title, description, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const unanswered = questions.find((q) => q.required && isAnswerMissing(answers[q.id]));
    if (unanswered) {
      setError("Please answer all required questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAssessment(token, answers);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Thank you</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Your response has been submitted. You can close this page now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-28 sm:py-12">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
      {description && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-5">
            <QuestionRenderer
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
            />
          </Card>
        ))}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-white/95 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto max-w-lg">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
