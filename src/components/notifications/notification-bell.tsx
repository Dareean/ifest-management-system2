"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Mail, AlertCircle, Calendar, FileText, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/data/notifications";

const typeIcons: Record<string, React.ReactNode> = {
  letter: <FileText className="size-4 text-accent-magenta" />,
  meeting: <Calendar className="size-4 text-accent-coral" />,
  kpi: <Target className="size-4 text-accent-green" />,
  task: <CheckCheck className="size-4 text-accent-lime" />,
  system: <AlertCircle className="size-4 text-accent-lilac" />,
};

export function NotificationBell({ initial }: { initial: { items: NotificationItem[]; unread: number } }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initial.items);
  const [unread, setUnread] = useState(initial.unread);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }

  function getTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "baru saja";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h`;
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-surface-container transition-colors"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 max-w-[calc(100vw-16px)] rounded-xl bg-surface-bright border border-outline-variant shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
            <p className="font-semibold text-sm">Notifikasi</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-accent-magenta hover:underline flex items-center gap-1"
              >
                <CheckCheck className="size-3" />
                Baca semua
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 && (
              <div className="py-xl text-center">
                <Bell className="size-8 mx-auto text-on-surface-variant/50 mb-sm" />
                <p className="text-sm text-on-surface-variant">Belum ada notifikasi</p>
              </div>
            )}

            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`w-full text-left px-lg py-md flex gap-md hover:bg-surface-container transition-colors ${
                  !n.isRead ? "bg-accent-lime/5" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {typeIcons[n.type] ?? <AlertCircle className="size-4 text-on-surface-variant" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? "font-semibold" : ""}`}>{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-[10px] text-on-surface-variant whitespace-nowrap">
                  {getTimeAgo(n.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
