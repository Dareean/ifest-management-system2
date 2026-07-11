import { Skeleton } from "@/components/ui/skeleton";

export function LettersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
