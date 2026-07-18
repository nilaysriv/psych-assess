"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileModal } from "./profile-modal";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/templates", label: "Assessments" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/awaiting-response", label: "Awaiting Response" },
];

type User = { name: string; email: string; avatarUrl: string | null };

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            ClinTrack
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="rounded-full ring-offset-2 ring-offset-white transition hover:ring-2 hover:ring-indigo-500 dark:ring-offset-zinc-950"
              aria-label="Open your profile"
            >
              <Avatar name={user.name || user.email} src={user.avatarUrl} />
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} user={user} />
    </header>
  );
}
