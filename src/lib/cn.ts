import { twMerge } from "tailwind-merge";

// Plain string concatenation can't resolve conflicting Tailwind
// utilities (e.g. a shared "w-full" default losing to a caller's
// "w-16" depending on Tailwind's internal stylesheet order rather
// than className order) -- twMerge resolves same-property conflicts
// by keeping the last one, which is what callers actually expect.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
