import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserNotifications, getUnreadCount } from "@/lib/data/notifications";
import { NotificationBell } from "./notification-bell";

async function BellData() {
  const [notifications, unread] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
  ]);

  return <NotificationBell initial={{ items: notifications, unread }} />;
}

function BellSkeleton() {
  return <Skeleton className="size-9 rounded-full" />;
}

export function BellSection() {
  return (
    <Suspense fallback={<BellSkeleton />}>
      <BellData />
    </Suspense>
  );
}
