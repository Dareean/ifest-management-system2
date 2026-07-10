"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Building2, Shield, UserPlus, ArrowLeft } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: Calendar },
  { href: "/admin/years", label: "Tahun Kepanitiaan", icon: Calendar },
  { href: "/admin/divisions", label: "Divisi", icon: Building2 },
  { href: "/admin/roles", label: "Role & Jabatan", icon: Shield },
  { href: "/admin/assignments", label: "Assign Personel", icon: UserPlus },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Dashboard
      </Link>

      <div>
        <p className="eyebrow text-on-surface-variant mb-xs">Admin Panel</p>
        <h1 className="text-4xl font-semibold tracking-tight leading-none">
          Manajemen Sistem
        </h1>
        <p className="mt-sm text-lg text-on-surface-variant">
          Kelola struktur organisasi kepanitiaan secara dinamis.
        </p>
      </div>

      <nav className="flex flex-wrap gap-xs mt-sm">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
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
  );
}
