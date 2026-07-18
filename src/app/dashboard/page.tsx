import Link from "next/link";
import { Card } from "@/components/ui/card";

const items = [
  {
    href: "/dashboard/templates",
    title: "Assessments",
    description: "Build and manage your assessment templates.",
  },
  {
    href: "/dashboard/clients",
    title: "Clients",
    description: "Your client roster and their assessment history.",
  },
  {
    href: "/dashboard/awaiting-response",
    title: "Awaiting Response",
    description: "Assessments sent but not yet completed.",
  },
];

export default function DashboardPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full p-5 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
