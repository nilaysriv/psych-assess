"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const AUTO_REFRESH_MS = 60_000;

export function DashboardRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => {
        router.refresh();
        setLastUpdated(new Date());
      });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
      setLastUpdated(new Date());
    });
  }

  return (
    <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
      {lastUpdated && (
        <span>
          Updated {lastUpdated.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isPending}>
        {isPending ? "Refreshing…" : "Refresh"}
      </Button>
    </div>
  );
}
