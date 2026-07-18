"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InstanceStatus, STATUS_LABELS, STATUS_TONES, effectiveStatus } from "@/lib/instance-status";
import { cancelInstance } from "../instances/actions";

export type AwaitingInstance = {
  id: string;
  clientId: string;
  clientName: string;
  templateTitle: string;
  sentAt: string;
  expiresAt: string;
};

export function AwaitingResponseList({ instances }: { instances: AwaitingInstance[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelTarget, setCancelTarget] = useState<AwaitingInstance | null>(null);
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
      <Card className="border-dashed p-10 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nothing pending — every assessment you've sent has been completed or cancelled.
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
      {instances.map((instance) => {
        const status = effectiveStatus(InstanceStatus.pending, new Date(instance.expiresAt));
        return (
          <Card key={instance.id} className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/clients/${instance.clientId}`}
                  className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                >
                  {instance.clientName}
                </Link>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {instance.templateTitle}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  Sent {new Date(instance.sentAt).toLocaleDateString()} · Expires{" "}
                  {new Date(instance.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setCancelTarget(instance)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
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
