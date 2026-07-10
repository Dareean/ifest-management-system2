import { getProfile } from "@/lib/data/profile";
import { ProfileClient } from "./client";

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-xxl">
        <p className="text-on-surface-variant">Login untuk melihat profil.</p>
      </div>
    );
  }

  return <ProfileClient profile={profile} />;
}
