"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  Users,
  CheckSquare,
  Shield,
} from "lucide-react";
import type { NotificationItem } from "@/lib/data/notifications";
import type { ProfileData } from "@/lib/data/profile";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getNavItems(level: number): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "OVERVIEW", icon: LayoutDashboard },
    { href: "/dashboard/tasks", label: "TASKS", icon: CheckSquare },
  ];

  if (level >= 60 && level !== 70) {
    items.push({ href: "/dashboard/letters", label: "SURAT", icon: FileText });
  }

  items.push({ href: "/dashboard/meetings", label: "RAPAT", icon: Calendar });

  if (level >= 55 || level === 70) {
    items.push({ href: "/dashboard/finance", label: "KEUANGAN", icon: DollarSign });
  }

  if (level >= 90 || level === 70) {
    items.push({ href: "/dashboard/finance/report", label: "LPJ", icon: FileText });
  }

  if (level >= 55) {
    items.push({ href: "/dashboard/members", label: "ANGGOTA", icon: Users });
    items.push({ href: "/dashboard/weekly-report", label: "LAPORAN", icon: FileText });
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
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isLaporanExpanded, setIsLaporanExpanded] = useState(pathname.startsWith("/dashboard/weekly-report"));

  useEffect(() => {
    if (pathname.startsWith("/dashboard/weekly-report")) {
      setIsLaporanExpanded(true);
    }
  }, [pathname]);

  const navItems = useMemo(() => {
    const level = profile?.assignment?.level ?? 0;
    return getNavItems(level);
  }, [profile?.assignment?.level]);

  // Dynamically compute sub-tabs for LAPORAN based on supervisor or division membership
  const laporanSubItems = useMemo(() => {
    if (!profile) return [];
    
    const level = profile.assignment?.level ?? 0;
    const nameLower = profile.fullName?.toLowerCase() || "";
    const isDaren = nameLower.includes("daren") || nameLower.includes("dareean");
    const isGabriel = nameLower.includes("gabriel");
    const isReyqal = nameLower.includes("reyqal");
    
    const baseHref = "/dashboard/weekly-report";
    
    const ALL_DIVISIONS = [
      { slug: "acara", label: "ACARA", dbName: "Acara" },
      { slug: "logistik", label: "LOGISTIK", dbName: "Logistik" },
      { slug: "lapangan", label: "LAPANGAN", dbName: "Lapangan" },
      { slug: "ekonomi-kreatif", label: "EKRAF", dbName: "Ekonomi Kreatif" },
      { slug: "konsumsi", label: "KONSUMSI", dbName: "Konsumsi" },
      { slug: "keamanan", label: "KEAMANAN", dbName: "Keamanan" },
      { slug: "humas", label: "HUMAS", dbName: "Humas" },
      { slug: "sponsorship", label: "SPONSORSHIP", dbName: "Sponsorship" },
      { slug: "kreativitas", label: "KREATIVITAS", dbName: "Kreativitas" }
    ];

    if (level >= 75 || level === 70) {
      // BPH: sees all
      return ALL_DIVISIONS.map(d => ({
        href: `${baseHref}?div=${d.slug}`,
        label: d.label,
        slug: d.slug
      }));
    } else if (isDaren) {
      return [
        { href: `${baseHref}?div=ekonomi-kreatif`, label: "EKRAF", slug: "ekonomi-kreatif" },
        { href: `${baseHref}?div=konsumsi`, label: "KONSUMSI", slug: "konsumsi" },
        { href: `${baseHref}?div=keamanan`, label: "KEAMANAN", slug: "keamanan" }
      ];
    } else if (isGabriel) {
      return [
        { href: `${baseHref}?div=acara`, label: "ACARA", slug: "acara" },
        { href: `${baseHref}?div=logistik`, label: "LOGISTIK", slug: "logistik" },
        { href: `${baseHref}?div=lapangan`, label: "LAPANGAN", slug: "lapangan" }
      ];
    } else if (isReyqal) {
      return [
        { href: `${baseHref}?div=humas`, label: "HUMAS", slug: "humas" },
        { href: `${baseHref}?div=sponsorship`, label: "SPONSORSHIP", slug: "sponsorship" },
        { href: `${baseHref}?div=kreativitas`, label: "KREATIVITAS", slug: "kreativitas" }
      ];
    } else {
      // Coordinator or regular member: sees their own division
      const userDivName = profile.assignment?.division || "";
      const matched = ALL_DIVISIONS.find(d => d.dbName.toLowerCase() === userDivName.toLowerCase());
      if (matched) {
        return [
          { href: `${baseHref}?div=${matched.slug}`, label: matched.label, slug: matched.slug }
        ];
      }
    }
    
    return [];
  }, [profile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/finance") return pathname === "/dashboard/finance";
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
        <div className="flex items-center gap-3 p-3.5 bg-[#0B0C10] rounded-2xl border border-slate-800 shadow-md mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#D7F77B] flex items-center justify-center font-bold shrink-0">
            <Shield className="size-5 text-[#0B0C10]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#D7F77B] font-sans leading-none">
              Panitia Panel
            </p>
            <p className="text-xs font-mono text-slate-400 truncate mt-1">
              Panitia IFEST
            </p>
          </div>
          <Link href="/login" className="text-xs text-pink-400 hover:underline font-bold font-mono shrink-0">
            Login
          </Link>
        </div>
      );
    }

    const rawRole = profile.assignment?.roleName || profile.assignment?.role || "Panitia";
    let cleanRole = rawRole;
    if (cleanRole.toLowerCase().includes("pic") || cleanRole.toLowerCase().includes("penanggung jawab")) {
      cleanRole = "PIC";
    }
    const formattedRole = cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1);
    const titleText = `${formattedRole} Panel`;
    const subtitleText = profile.fullName ? profile.fullName : `${formattedRole} Panitia IFEST`;

    return (
      <Link href="/dashboard/profile" className="flex items-center gap-3 p-3.5 bg-[#0B0C10] rounded-2xl border border-slate-800 shadow-md mb-2 hover:border-[#D7F77B]/40 transition-colors group cursor-pointer">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-slate-700 group-hover:border-[#D7F77B] transition-colors"
          />
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#D7F77B] flex items-center justify-center font-bold shrink-0">
            <Shield className="size-5 text-[#0B0C10]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#D7F77B] font-sans leading-tight truncate">
            {titleText}
          </p>
          <p className="text-xs font-mono text-slate-400 truncate mt-1 group-hover:text-slate-200 transition-colors">
            {subtitleText}
          </p>
        </div>
      </Link>
    );
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.href);
        const hasSubItems = item.label === "LAPORAN" && laporanSubItems.length > 0;
        const isExpanded = hasSubItems && isLaporanExpanded;

        return (
          <div key={item.href} className="flex flex-col">
            <div className="flex items-center w-full">
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all select-none group uppercase tracking-wider font-mono",
                  isActive
                    ? "bg-[#04000D] text-[#DCEEB1] shadow-sm font-extrabold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-slate-100/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    className={cn(
                      "size-[17px] shrink-0 transition-colors", 
                      isActive ? "text-[#DCEEB1]" : "text-slate-500 group-hover:text-slate-800"
                    )} 
                  />
                  <span className="font-mono font-extrabold">{item.label}</span>
                </div>
                {!hasSubItems && isActive && <ChevronRight className="size-4 shrink-0 text-[#DCEEB1]" />}
              </Link>

              {hasSubItems && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsLaporanExpanded(!isLaporanExpanded);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer mr-1",
                    isActive ? "text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4 shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0" />
                  )}
                </button>
              )}
            </div>

            {/* Sub-items rendering */}
            {hasSubItems && isExpanded && (
              <div className="pl-6 ml-4 border-l border-slate-200 flex flex-col gap-1 mt-1">
                {laporanSubItems.map((sub) => {
                  const isSubActive = searchParams.get("div") === sub.slug;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "pl-4 pr-3 py-2 rounded-lg text-[11px] font-bold tracking-wider transition-all select-none uppercase font-mono",
                        isSubActive
                          ? "bg-slate-900 text-white font-black border-l-2 border-pink-500 pl-3"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  const BottomActions = () => (
    <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-200/60">
      <button
        onClick={() => {
          setIsOpen(false);
          handleLogout();
        }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-extrabold text-[#FF3D8B] hover:bg-[#FF3D8B]/5 transition-colors cursor-pointer w-full text-left font-mono tracking-widest uppercase group"
      >
        <LogOut className="size-[17px] shrink-0 text-[#FF3D8B] transition-colors" />
        <span>KELUAR</span>
      </button>
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
          <div className="flex items-center justify-center w-full border-b border-slate-100 pb-4">
            <LogoSection />
          </div>

          <ProfileCard />

          <NavLinks />
        </div>

        <BottomActions />
      </aside>
    </>
  );
}
