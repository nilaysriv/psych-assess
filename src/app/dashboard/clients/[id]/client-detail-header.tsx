"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ClientFormModal, ClientFormValues } from "../client-form-modal";
import { archiveClient, unarchiveClient } from "../actions";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  archivedAt: string | null;
};

export function ClientDetailHeader({ client }: { client: Client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial: ClientFormValues = {
    id: client.id,
    name: client.name,
    phone: client.phone ?? "",
    email: client.email ?? "",
    notes: client.notes ?? "",
  };

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      try {
        await archiveClient(client.id);
        setConfirmingArchive(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't archive this client.");
        setConfirmingArchive(false);
      }
    });
  }

  function handleUnarchive() {
    setError(null);
    startTransition(async () => {
      try {
        await unarchiveClient(client.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't restore this client.");
      }
    });
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{client.name}</h1>
            {client.archivedAt && <Badge tone="neutral">Archived</Badge>}
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {[client.phone, client.email].filter(Boolean).join(" · ") || "No contact info on file"}
          </p>
          {client.notes && (
            <p className="mt-3 max-w-prose text-sm text-zinc-600 dark:text-zinc-300">{client.notes}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          {client.archivedAt ? (
            <Button variant="secondary" size="sm" disabled={isPending} onClick={handleUnarchive}>
              Restore
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setConfirmingArchive(true)}
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ClientFormModal
        open={editing}
        initial={initial}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={confirmingArchive}
        title={`Archive "${client.name}"?`}
        description="Their record and history stay intact — you can restore them anytime from Show archived."
        confirmLabel="Archive"
        destructive
        confirming={isPending}
        onConfirm={handleArchive}
        onCancel={() => setConfirmingArchive(false)}
      />
    </Card>
  );
}
