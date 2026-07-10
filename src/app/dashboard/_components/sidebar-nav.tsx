"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  DollarSign,
  Home,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { NotificationItem } from "@/lib/data/notifications";
import type { ProfileData } from "@/lib/data/profile";

interface SidebarNavProps {
  profile: ProfileData | null;
  notifications: { items: NotificationItem[]; unread: number };
}

export function SidebarNav({ profile, notifications }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = [
    { href: "/dashboard", label: "OVERVIEW", icon: LayoutDashboard },
    { href: "/dashboard/kpi", label: "KPI", icon: Target },
    { href: "/dashboard/letters", label: "SURAT", icon: FileText },
    { href: "/dashboard/meetings", label: "RAPAT", icon: Calendar },
    { href: "/dashboard/finance", label: "KEUANGAN", icon: DollarSign },
    { href: "/dashboard/profile", label: "PROFIL", icon: User },
    { href: "/admin", label: "ADMIN", icon: Settings },
  ];

  // Helper to check if item is active
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Profile initial fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const LogoSection = () => (
    <div className="flex items-center gap-2 select-none">
      <img
        src="/assets/logo_utama/logo_untad.webp"
        alt="Logo UNTAD"
        className="h-8 w-auto object-contain shrink-0"
      />
      <img
        src="/assets/logo_utama/HMTI LOGO.webp"
        alt="Logo HMTI"
        className="h-8 w-auto object-contain shrink-0"
      />
      <img
        src="/assets/logo_utama/Logo-IFEST-2026.webp"
        alt="Logo IFEST"
        className="h-9 w-auto object-contain shrink-0 ml-1"
      />
    </div>
  );

  const ProfileCard = () => {
    if (!profile) {
      return (
        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-block-lilac/30 flex items-center justify-center font-bold text-primary">
            G
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-on-surface">Tamu</p>
            <p className="text-xs text-on-surface-variant truncate">Belum masuk</p>
          </div>
          <Link href="/login" className="text-xs text-accent-magenta hover:underline font-medium font-sans shrink-0">
            Login
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-block-lilac flex items-center justify-center font-bold text-primary shrink-0">
            {getInitials(profile.fullName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-on-surface leading-tight">
            {profile.fullName}
          </p>
          <p className="text-xs font-mono text-on-surface-variant truncate mt-0.5">
            {profile.email}
          </p>
        </div>
      </div>
    );
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1.5 mt-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all select-none group",
              isActive
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="size-5 shrink-0" />
              <span className="tracking-wide font-sans">{item.label}</span>
            </div>
            {isActive && <ChevronRight className="size-4 shrink-0 text-on-primary" />}
          </Link>
        );
      })}
    </nav>
  );

  const BottomActions = () => (
    <div className="flex flex-col gap-1.5 pt-4 border-t border-outline-variant/40">
      <Link
        href="/"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
      >
        <Home className="size-5 shrink-0" />
        <span className="tracking-wide font-sans">BERANDA</span>
      </Link>
      
      {profile && (
        <button
          onClick={() => {
            setIsOpen(false);
            handleLogout();
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error-container/20 transition-colors text-left w-full cursor-pointer"
        >
          <LogOut className="size-5 shrink-0" />
          <span className="tracking-wide font-sans">KELUAR</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 h-16 bg-white border-b border-outline-variant/40 sticky top-0 z-40 w-full shrink-0">
        <LogoSection />
        
        <div className="flex items-center gap-3">
          <NotificationBell initial={notifications} />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Overlay and Menu Panel) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full p-6 justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/40">
                <LogoSection />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="mt-6">
                <ProfileCard />
              </div>

              {/* Navigation list */}
              <div className="mt-2">
                <NavLinks />
              </div>
            </div>

            {/* Bottom Actions */}
            <BottomActions />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-outline-variant/40 p-6 justify-between shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <LogoSection />
            <NotificationBell initial={notifications} />
          </div>

          <ProfileCard />

          <NavLinks />
        </div>

        <BottomActions />
      </aside>
    </>
  );
}
