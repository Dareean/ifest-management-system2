"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Building2, Shield, UserPlus, Home, Settings, Mail } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: Settings },
  { href: "/admin/years", label: "Tahun Kepanitiaan", icon: Calendar },
  { href: "/admin/divisions", label: "Divisi", icon: Building2 },
  { href: "/admin/roles", label: "Role & Jabatan", icon: Shield },
  { href: "/admin/assignments", label: "Assign Personel", icon: UserPlus },
  { href: "/admin/broadcast", label: "Broadcast Email", icon: Mail },
];

export function AdminNav({ roleLevel = 0 }: { roleLevel?: number }) {
  const pathname = usePathname();

  const visibleItems = adminNavItems.filter((item) => {
    if (item.href === "/admin/broadcast" && roleLevel < 100) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 mb-8 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 md:p-8">
      {/* Breadcrumb & Home Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] text-on-surface-variant select-none">
          <Link href="/dashboard" className="hover:text-accent-magenta transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest">
            <Home className="size-3 text-accent-magenta" />
            DASHBOARD
          </Link>
          <span className="text-[#04000D]/20">/</span>
          <span className="font-bold uppercase tracking-widest text-accent-magenta">
            ADMIN PANEL
          </span>
        </div>
      </div>

      {/* Title Area */}
      <div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta block mb-1">
          SISTEM ORGANISASI
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
          Manajemen Sistem
        </h1>
        <p className="mt-1.5 text-sm text-on-surface-variant/80 font-normal">
          Kelola struktur organisasi kepanitiaan secara dinamis dan terintegrasi.
        </p>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 pt-4 border-t border-[#04000D]/5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer border",
                isActive
                  ? "bg-[#04000D] border-[#04000D] text-[#DCEEB1] shadow-sm"
                  : "bg-[#FDF8FA] border-[#04000D]/5 text-on-surface-variant hover:text-on-surface hover:border-[#04000D]/15 hover:bg-white"
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
