"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InstanceStatus, STATUS_LABELS, STATUS_TONES, effectiveStatus } from "@/lib/instance-status";
import { cancelInstance } from "../../instances/actions";

export type InstanceSummary = {
  id: string;
  templateTitle: string;
  status: InstanceStatus;
  sentAt: string;
  completedAt: string | null;
  expiresAt: string;
  totalScore: number | null;
  severityLabel: string | null;
};

export function InstanceList({ instances }: { instances: InstanceSummary[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelTarget, setCancelTarget] = useState<InstanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function confirmCancel() {
    if (!cancelTarget) return;
    const id = cancelTarget.id;
    setError(null);
    startTransition(async () => {
      try {
        await cancelInstance(id);
        setCancelTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't cancel this send.");
        setCancelTarget(null);
      }
    });
  }

  if (instances.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Sent assessments and score trends will appear here once you send this client an
        assessment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {instances.map((instance) => {
        const status = effectiveStatus(instance.status, new Date(instance.expiresAt));
        return (
          <div
            key={instance.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {instance.templateTitle}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sent {new Date(instance.sentAt).toLocaleDateString()}
                {instance.completedAt &&
                  ` · Completed ${new Date(instance.completedAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {instance.totalScore !== null && (
                <Badge tone="indigo">
                  Score: {instance.totalScore}
                  {instance.severityLabel ? ` (${instance.severityLabel})` : ""}
                </Badge>
              )}
              <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
              {status === InstanceStatus.pending && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setCancelTarget(instance)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel this send?"
        description="The link will stop working. This can't be undone."
        confirmLabel="Cancel send"
        destructive
        confirming={isPending}
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
