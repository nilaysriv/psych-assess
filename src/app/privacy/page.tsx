import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back
        </Link>

        <Card className="space-y-6 p-8 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <div>
            <h1 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Last updated 2026</p>
          </div>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">What this app is</h2>
            <p>
              ClinTrack is a clinical assessment tool used by a psychologist to build, send, and
              score psychometric questionnaires with her clients. This page explains what data
              the app collects, how it&apos;s used, and who can see it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Who can access data</h2>
            <p>
              The only people with access to client data are the clinician, via her login, and —
              per assessment — the specific client who holds that assessment&apos;s unique link.
              There is no public listing, search, or browsing of any data in this app.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">What&apos;s collected</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-100">Client contact info</strong> —
                name, phone, email, and clinician notes, entered by the clinician for her own
                reference and to generate assessment links. Never used for marketing, sold, or
                shared with any third party.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-100">Assessment responses</strong> —
                answers a client submits via their link, plus any computed score and severity
                label. Retained indefinitely by default, matching the clinician&apos;s need for a
                durable longitudinal record.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              How clients access the app
            </h2>
            <p>
              Clients never create an account. Their only interaction is opening a link they were
              given directly and submitting one form. That link uses a long, cryptographically
              random token — not a guessable ID — as its only access control, and expires after 14
              days.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">No tracking</h2>
            <p>
              The client-facing assessment page has no analytics, ad pixels, or third-party
              tracking scripts of any kind. A client filling out a mental-health questionnaire
              hasn&apos;t consented to being tracked by anything beyond the assessment itself.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Security measures</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>All traffic is encrypted over HTTPS.</li>
              <li>Clinician passwords are hashed (bcrypt), never stored in plain text.</li>
              <li>Sessions use a signed, httpOnly cookie not readable by page scripts.</li>
              <li>Client records are archived, never permanently deleted.</li>
              <li>Database encryption at rest is provided by the hosting database platform.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <p>
              <strong>This page describes the technical privacy measures built into the app — it
              is not a substitute for a legally reviewed privacy policy.</strong> Mental health
              data may carry stricter data-protection obligations depending on jurisdiction. If
              you are the client receiving an assessment link and have questions about how your
              information is handled, please ask your clinician directly.
            </p>
          </section>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
