import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Glassmorphism Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-32 rounded-2xl shrink-0" />
      </div>

      {/* Profile Hero Banner */}
      <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <Skeleton className="size-24 rounded-3xl shrink-0" />
        <div className="flex-1 space-y-3 w-full text-center md:text-left">
          <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-40 mx-auto md:mx-0" />
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <Skeleton className="h-6 w-24 rounded-xl" />
            <Skeleton className="h-6 w-28 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 bg-white border border-outline-variant/40 rounded-2xl p-2 shadow-sm">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Form / Content Card */}
      <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-outline-variant/30 pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
