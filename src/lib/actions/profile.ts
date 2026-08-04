"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: unknown, formData: FormData) {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { error: "Silakan login terlebih dahulu" };

  const admin = createAdminClient();
  const fullName = formData.get("fullName") as string;
  const nim = formData.get("nim") as string;
  const phone = formData.get("phone") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  const { error } = await admin
    .from("profiles")
    .upsert({
      id: userId,
      full_name: fullName,
      nim,
      phone: phone || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function changePassword(prevState: unknown, formData: FormData) {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { error: "Silakan login terlebih dahulu" };

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Semua field harus diisi." };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const { error } = await auth.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
