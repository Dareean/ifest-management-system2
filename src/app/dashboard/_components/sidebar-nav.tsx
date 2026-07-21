"use client";

import { useState, useMemo } from "react";
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
  Users,
} from "lucide-react";
import type { NotificationItem } from "@/lib/data/notifications";
import type { ProfileData } from "@/lib/data/profile";

const ROLE_MAP: Record<string, { slug: string; level: number }> = {
  "PIC / Penanggung Jawab": { slug: "pic", level: 100 },
  "Ketua Panitia": { slug: "ketua-panitia", level: 90 },
  "Wakil Ketua": { slug: "wakil-ketua", level: 80 },
  "Sekretaris I": { slug: "sekretaris", level: 75 },
  "Sekretaris II": { slug: "sekretaris", level: 75 },
  "Bendahara": { slug: "bendahara", level: 70 },
  "Koordinator Divisi": { slug: "koordinator", level: 60 },
  "Wakil Koordinator": { slug: "wakil-koordinator", level: 55 },
  "PIC / Penanggung Jawab Subdivisi": { slug: "pic-sub", level: 53 },
  "Anggota": { slug: "anggota", level: 50 },
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getRoleLevel(roleName: string | undefined): number {
  return ROLE_MAP[roleName ?? ""]?.level ?? 0;
}

function getNavItems(level: number): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "OVERVIEW", icon: LayoutDashboard },
    { href: "/dashboard/kpi", label: "KPI", icon: Target },
  ];

  if (level >= 60 && level !== 70) {
    items.push({ href: "/dashboard/letters", label: "SURAT", icon: FileText });
  }

  items.push({ href: "/dashboard/meetings", label: "RAPAT", icon: Calendar });

  if (level >= 90 || level === 70) {
    items.push({ href: "/dashboard/finance", label: "KEUANGAN", icon: DollarSign });
  }

  if (level >= 55) {
    items.push({ href: "/dashboard/members", label: "ANGGOTA", icon: Users });
  }

  if (level >= 80) {
    items.push({ href: "/admin", label: "ADMIN", icon: Settings });
  }

  return items;
}

interface SidebarNavProps {
  profile: ProfileData | null;
  notifications: { items: NotificationItem[]; unread: number };
}

export function SidebarNav({ profile, notifications }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = useMemo(() => {
    const level = getRoleLevel(profile?.assignment?.role);
    return getNavItems(level);
  }, [profile?.assignment?.role]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const LogoSection = ({ isHeader = false }: { isHeader?: boolean }) => (
    <div className={`flex select-none ${isHeader ? "items-center gap-2.5" : "flex-col items-center justify-center gap-2.5 w-full"}`}>
      <div className="flex items-center justify-center gap-2.5">
        <img
          src="/assets/logo_utama/logo_untad.webp"
          alt="Logo UNTAD"
          className="h-7 w-auto object-contain shrink-0"
        />
        <div className="w-px h-5 bg-slate-200 shrink-0" />
        <img
          src="/assets/logo_utama/HMTI LOGO.webp"
          alt="Logo HMTI"
          className="h-7 w-auto object-contain shrink-0"
        />
        <div className="w-px h-5 bg-slate-200 shrink-0" />
        <img
          src="/assets/logo_utama/Logo-IFEST-2026.webp"
          alt="Logo IFEST"
          className="h-9 w-auto object-contain shrink-0 ml-1"
        />
      </div>
      {!isHeader && (
        <span className="font-mono text-sm font-black tracking-[0.35em] text-on-surface uppercase mt-0.5">
          Sintuwu
        </span>
      )}
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
    <nav className="flex flex-col gap-1.5">
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

    </div>
  );

  return (
    <>
      <header className="flex lg:hidden items-center justify-between px-6 h-16 bg-white border-b border-outline-variant/40 sticky top-0 z-40 w-full shrink-0">
        <LogoSection isHeader />

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

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full p-6 justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <div>
              <div className="flex flex-col items-center justify-center pb-6 border-b border-outline-variant/40 relative w-full">
                <LogoSection />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-0 top-0.5 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6">
                <ProfileCard />
              </div>

              <div className="mt-6">
                <NavLinks />
              </div>
            </div>

            <BottomActions />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-outline-variant/40 p-6 justify-between shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-center w-full border-b border-outline-variant/30 pb-5">
            <LogoSection />
          </div>

          <NavLinks />
        </div>

        <BottomActions />
      </aside>
    </>
  );
}
