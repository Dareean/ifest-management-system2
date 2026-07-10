import type { ReactNode } from "react";
import { DashboardNav } from "./_components/dashboard-nav";
import { getUserNotifications, getUnreadCount } from "@/lib/data/notifications";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [notifications, unread] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav notifications={{ items: notifications, unread }} />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-md py-xl">
        {children}
      </main>
    </div>
  );
}
