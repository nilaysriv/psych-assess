"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { createClient, updateClient } from "./actions";

export type ClientFormValues = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type Props = {
  open: boolean;
  initial?: ClientFormValues;
  onClose: () => void;
  onSaved: (id: string) => void;
};

const empty: ClientFormValues = { name: "", phone: "", email: "", notes: "" };

export function ClientFormModal({ open, initial, onClose, onSaved }: Props) {
  const [values, setValues] = useState<ClientFormValues>(initial ?? empty);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (values.id) {
        await updateClient(values.id, values);
        onSaved(values.id);
      } else {
        const { id } = await createClient(values);
        onSaved(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save this client.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={values.id ? "Edit client" : "Add client"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="client-name">Name</Label>
          <Input
            id="client-name"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="client-phone">Phone</Label>
          <Input
            id="client-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="client-notes">Notes (optional)</Label>
          <Textarea
            id="client-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
