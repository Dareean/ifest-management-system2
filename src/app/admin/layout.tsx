import type { ReactNode } from "react";
import { AdminNav } from "./_components/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-section-gap">
      <AdminNav />
      <div className="w-full max-w-[1280px] mx-auto px-md">
        {children}
      </div>
    </div>
  );
}
