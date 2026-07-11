import { Suspense } from "react";
import { getCurrentUserId } from "@/lib/data/personal-dashboard";
import { DashboardContent, GlobalView } from "./_components/dashboard-content";
import { DashboardSkeleton } from "./_components/skeletons/dashboard-skeleton";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return <GlobalView />;
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent userId={userId} />
    </Suspense>
  );
}
