"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { ProfileData } from "@/lib/data/profile";

interface ProfileDropdownProps {
  profile: ProfileData | null;
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!profile) return null;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 hover:bg-surface-container rounded-full lg:rounded-xl transition-all cursor-pointer border border-transparent hover:border-outline-variant/30 select-none group"
      >
        <div className="w-8 h-8 rounded-full bg-block-lilac/30 flex items-center justify-center font-mono font-black text-xs text-primary shrink-0">
          {getInitials(profile.fullName)}
        </div>
        <div className="hidden md:flex flex-col text-left min-w-0 pr-1">
          <p className="text-xs font-bold truncate text-on-surface leading-tight max-w-[120px]">
            {profile.fullName}
          </p>
          <p className="font-mono text-[9px] text-on-surface-variant/70 truncate mt-0.5 max-w-[120px]">
            {profile.email}
          </p>
        </div>
        <ChevronDown className={`size-4 text-on-surface-variant transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant/40 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-4 py-2 border-b border-outline-variant/30 md:hidden">
            <p className="text-xs font-bold text-on-surface truncate">{profile.fullName}</p>
            <p className="font-mono text-[9px] text-on-surface-variant/70 truncate mt-0.5">{profile.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors uppercase tracking-wider"
          >
            <User className="size-4 text-on-surface-variant" />
            <span>Profil</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors uppercase tracking-wider"
          >
            <Settings className="size-4 text-on-surface-variant" />
            <span>Settings</span>
          </Link>
          <div className="h-px bg-outline-variant/30 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-error hover:bg-error-container/10 transition-colors uppercase tracking-wider w-full text-left cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
}
