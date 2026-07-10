import type { ReactNode } from "react";
import { AdminNav } from "./_components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-[1280px] mx-auto px-md py-xl w-full">
        <AdminNav />
        <div className="mt-xl">{children}</div>
      </div>
    </div>
  );
}
