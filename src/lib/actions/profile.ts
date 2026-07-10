"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: unknown, formData: FormData) {
  const admin = createAdminClient();
  const userId = formData.get("userId") as string;
  const fullName = formData.get("fullName") as string;
  const nim = formData.get("nim") as string;
  const phone = formData.get("phone") as string;

  if (!userId) return { error: "User tidak ditemukan" };

  const { error } = await admin
    .from("profiles")
    .upsert({
      id: userId,
      full_name: fullName,
      nim,
      phone: phone || null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  return { success: true };
}
