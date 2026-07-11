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
