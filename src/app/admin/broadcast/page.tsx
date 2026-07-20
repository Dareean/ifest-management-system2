import { requireRole } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import { BroadcastClient } from "./client";

export default async function AdminBroadcastPage() {
  const auth = await requireRole(100);

  if (!auth.authorized) {
    redirect("/admin");
  }

  return <BroadcastClient />;
}
