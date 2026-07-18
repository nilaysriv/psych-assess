"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTemplate, duplicateTemplate } from "./actions";

type TemplateSummary = {
  id: string;
  title: string;
  description: string | null;
  hasScoring: boolean;
  questionCount: number;
  sentCount: number;
  updatedAt: string;
};

export function TemplateList({ templates }: { templates: TemplateSummary[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateSummary | null>(null);

  function handleDuplicate(id: string) {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        const { id: newId } = await duplicateTemplate(id);
        router.push(`/dashboard/templates/${newId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't duplicate this assessment.");
      } finally {
        setBusyId(null);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      try {
        await deleteTemplate(id);
        setDeleteTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't delete this assessment.");
        setDeleteTarget(null);
      } finally {
        setBusyId(null);
      }
    });
  }

  if (templates.length === 0) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No assessments yet. Create your first one to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {templates.map((template) => {
        const busy = isPending && busyId === template.id;
        return (
          <Card key={template.id} className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/templates/${template.id}`}
                  className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                >
                  {template.title}
                </Link>
                {template.description && (
                  <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {template.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge>{template.questionCount} question{template.questionCount === 1 ? "" : "s"}</Badge>
                  {template.hasScoring && <Badge tone="indigo">Scored</Badge>}
                  {template.sentCount > 0 && (
                    <Badge tone="blue">
                      Sent {template.sentCount} time{template.sentCount === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/dashboard/templates/${template.id}`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => handleDuplicate(template.id)}
                >
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy || template.sentCount > 0}
                  title={
                    template.sentCount > 0
                      ? "Sent assessments can't be deleted"
                      : undefined
                  }
                  onClick={() => setDeleteTarget(template)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        confirming={isPending && busyId === deleteTarget?.id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
