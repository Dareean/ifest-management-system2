import { Skeleton } from "@/components/ui/skeleton";

export function MeetingsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant/60 rounded-xl p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
