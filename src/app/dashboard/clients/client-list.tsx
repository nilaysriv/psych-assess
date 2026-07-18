"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InstanceStatus } from "@/generated/prisma/enums";
import { ClientFormModal, ClientFormValues } from "./client-form-modal";
import { SendAssessmentModal } from "./send-assessment-modal";
import { archiveClient, unarchiveClient } from "./actions";

export type ClientSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  archivedAt: string | null;
  lastAssessment: { sentAt: string; status: InstanceStatus } | null;
};

type TemplateOption = { id: string; title: string };

export function ClientList({
  clients,
  templates,
}: {
  clients: ClientSummary[];
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [formTarget, setFormTarget] = useState<ClientFormValues | "new" | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ClientSummary | null>(null);
  const [sendTarget, setSendTarget] = useState<ClientSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients
      .filter((c) => (showArchived ? true : !c.archivedAt))
      .filter((c) => !term || c.name.toLowerCase().includes(term));
  }, [clients, search, showArchived]);

  function confirmArchive() {
    if (!archiveTarget) return;
    const id = archiveTarget.id;
    setError(null);
    startTransition(async () => {
      try {
        await archiveClient(id);
        setArchiveTarget(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't archive this client.");
        setArchiveTarget(null);
      }
    });
  }

  function handleUnarchive(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        await unarchiveClient(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't restore this client.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Clients</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Your client roster.</p>
        </div>
        <Button onClick={() => setFormTarget("new")}>Add Client</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="max-w-xs"
        />
        <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded accent-indigo-600"
          />
          Show archived
        </label>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {clients.length === 0 ? "No clients yet. Add your first one to get started." : "No clients match."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Card key={client.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                    >
                      {client.name}
                    </Link>
                    {client.archivedAt && <Badge tone="neutral">Archived</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {[client.phone, client.email].filter(Boolean).join(" · ") || "No contact info"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {client.lastAssessment
                      ? `Last sent ${new Date(client.lastAssessment.sentAt).toLocaleDateString()}`
                      : "No assessments yet"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!client.archivedAt && (
                    <Button size="sm" onClick={() => setSendTarget(client)}>
                      Send
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setFormTarget({
                        id: client.id,
                        name: client.name,
                        phone: client.phone ?? "",
                        email: client.email ?? "",
                        notes: client.notes ?? "",
                      })
                    }
                  >
                    Edit
                  </Button>
                  {client.archivedAt ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleUnarchive(client.id)}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setArchiveTarget(client)}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ClientFormModal
        key={formTarget === "new" ? "new" : formTarget?.id ?? "closed"}
        open={formTarget !== null}
        initial={formTarget === "new" ? undefined : formTarget ?? undefined}
        onClose={() => setFormTarget(null)}
        onSaved={() => {
          setFormTarget(null);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        title={`Archive "${archiveTarget?.name}"?`}
        description="Their record and history stay intact — you can restore them anytime from Show archived."
        confirmLabel="Archive"
        destructive
        confirming={isPending}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      {sendTarget && (
        <SendAssessmentModal
          open
          clientId={sendTarget.id}
          clientName={sendTarget.name}
          templates={templates}
          onClose={() => setSendTarget(null)}
        />
      )}
    </div>
  );
}
