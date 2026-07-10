"use client";

import { useEffect, useState } from "react";

export function HeaderClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="h-8 w-64 bg-surface-container-low/50 animate-pulse rounded-full border border-outline-variant/30" />
    );
  }

  const day = time.toLocaleDateString("id-ID", { weekday: "long" });
  const date = time.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const clock = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-on-surface-variant bg-surface-container-low/50 px-3.5 py-1.5 rounded-full border border-outline-variant/30 select-none">
      <span>{day}, {date}</span>
      <span className="text-outline-variant/60">•</span>
      <span className="text-accent-magenta tabular-nums">{clock}</span>
    </div>
  );
}
