import type { ReactNode } from "react";
import { SidebarSection } from "./_components/sidebar-wrapper";
import { BellSection } from "@/components/notifications/bell-wrapper";
import { HeaderClock } from "@/components/header-clock";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface">
      <SidebarSection />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="hidden lg:flex items-center justify-end gap-5 px-10 h-16 bg-white border-b border-outline-variant/40 sticky top-0 z-30 w-full shrink-0">
          <HeaderClock />
          <BellSection />
        </header>
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
