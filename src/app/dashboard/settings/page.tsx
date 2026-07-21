import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data/profile";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return <SettingsClient profile={profile} />;
}
