"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Target,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import type { NotificationItem } from "@/lib/data/notifications";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/kpi", label: "KPI", icon: Target },
  { href: "/dashboard/letters", label: "Surat", icon: FileText },
  { href: "/dashboard/meetings", label: "Rapat", icon: Calendar },
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function DashboardNav({ notifications }: {
  notifications: { items: NotificationItem[]; unread: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-md h-16">
        <div className="flex items-center gap-lg">
          <Link href="/dashboard" className="font-sans text-xl font-semibold tracking-tight">
            IMS
          </Link>

          <nav className="hidden md:flex items-center gap-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-sm">
          <NotificationBell initial={notifications} />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
