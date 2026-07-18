import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 py-6 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-zinc-500 dark:text-zinc-400">
        <p>© {new Date().getFullYear()} ClinTrack</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
