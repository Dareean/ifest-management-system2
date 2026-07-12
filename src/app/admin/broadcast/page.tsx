import { requireRole } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import { BroadcastClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  const auth = await requireRole(100);

  if (!auth.authorized) {
    redirect("/admin");
  }

  return <BroadcastClient />;
}
