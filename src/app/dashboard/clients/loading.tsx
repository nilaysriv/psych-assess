import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ClientsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="mb-4 h-10 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 sm:p-5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-48" />
          </Card>
        ))}
      </div>
    </div>
  );
}
