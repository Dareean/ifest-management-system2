import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-outline-variant/40 p-6 justify-between shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-9" />
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl">
              <Skeleton className="size-5" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1.5 pt-4 border-t border-outline-variant/40">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
          <Skeleton className="size-5" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </aside>
  );
}
