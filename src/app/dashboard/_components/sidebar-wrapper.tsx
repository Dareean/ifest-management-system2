import { Suspense } from "react";
import { getUserNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile } from "@/lib/data/profile";
import { SidebarNav } from "./sidebar-nav";
import { SidebarSkeleton } from "./sidebar-skeleton";

async function SidebarData() {
  const [notifications, unread, profile] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
    getProfile(),
  ]);

  return (
    <SidebarNav profile={profile} notifications={{ items: notifications, unread }} />
  );
}

export function SidebarSection() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarData />
    </Suspense>
  );
}
