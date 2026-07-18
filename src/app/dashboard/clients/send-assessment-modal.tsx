"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { sendAssessment } from "../instances/actions";

type TemplateOption = { id: string; title: string };

type Props = {
  open: boolean;
  clientName: string;
  clientId: string;
  templates: TemplateOption[];
  onClose: () => void;
};

export function SendAssessmentModal({ open, clientName, clientId, templates, onClose }: Props) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    setLink(null);
    setError(null);
    setCopied(false);
    onClose();
    router.refresh();
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) return;
    setError(null);
    setSubmitting(true);
    try {
      const { url } = await sendAssessment(clientId, templateId);
      setLink(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send this assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  if (templates.length === 0) {
    return (
      <Modal open={open} onClose={handleClose} title="Send an assessment">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          You don't have any assessments yet. Create one first from the Assessments tab.
        </p>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Send an assessment to ${clientName}`}>
      {link ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Share this link with {clientName}. It expires in 14 days and can only be used once.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
            <code className="flex-1 overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300">
              {link}
            </code>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Done
            </Button>
            <Button onClick={handleCopy}>{copied ? "Copied!" : "Copy Link"}</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <Label htmlFor="template">Assessment</Label>
            <Select
              id="template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </Select>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
