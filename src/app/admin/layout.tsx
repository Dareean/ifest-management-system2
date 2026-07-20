import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SidebarNav } from "../dashboard/_components/sidebar-nav";
import { getUserNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile } from "@/lib/data/profile";
import { AdminNav } from "./_components/admin-nav";

const ROLE_LEVELS: Record<string, number> = {
  "PIC / Penanggung Jawab": 100,
  "Ketua Panitia": 90,
  "Wakil Ketua": 80,
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [notifications, unread, profile] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
    getProfile(),
  ]);

  const roleLevel = ROLE_LEVELS[profile?.assignment?.role ?? ""] ?? 0;

  if (roleLevel < 80) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <SidebarNav profile={profile} notifications={{ items: notifications, unread }} />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8 md:px-10 md:py-12">
          <AdminNav roleLevel={roleLevel} />
          {children}
        </main>
      </div>
    </div>
  );
}
