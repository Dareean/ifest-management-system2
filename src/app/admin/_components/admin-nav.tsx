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
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant select-none">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          DASHBOARD
        </Link>
        <span>/</span>
        <span className="text-on-surface font-bold">ADMIN PANEL</span>
      </div>

      {/* Title Area */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Manajemen Sistem
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Kelola struktur organisasi kepanitiaan secara dinamis dan terintegrasi.
        </p>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2.5 pb-4 border-b border-outline-variant/20">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 select-none cursor-pointer border",
                isActive
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-white border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:border-primary/30"
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
