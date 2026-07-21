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
    <div className="flex flex-col gap-6 mb-8 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Breadcrumb & Home Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant select-none">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="size-3" />
            DASHBOARD
          </Link>
          <span>/</span>
          <span className="text-on-surface font-bold">ADMIN PANEL</span>
        </div>
      </div>

      {/* Title Area */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">
          Manajemen Sistem
        </h1>
        <p className="mt-1.5 text-sm text-on-surface-variant font-medium">
          Kelola struktur organisasi kepanitiaan secara dinamis dan terintegrasi.
        </p>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/30">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase transition-all duration-200 select-none cursor-pointer border",
                isActive
                  ? "bg-primary border-transparent text-white shadow-md shadow-primary/10"
                  : "bg-white border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:border-primary/40 hover:bg-surface-container-lowest"
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
