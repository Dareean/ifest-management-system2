import type { ReactNode } from "react";
import { SidebarNav } from "./_components/sidebar-nav";
import { getUserNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [notifications, unread, profile] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
    getProfile(),
  ]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <SidebarNav profile={profile} notifications={{ items: notifications, unread }} />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8 md:px-10 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

