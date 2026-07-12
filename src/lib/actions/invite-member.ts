"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export async function inviteMember(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const admin = createAdminClient();

  // Get caller's assignment
  const { data: callerAssignment } = await admin
    .from("committee_assignments")
    .select(`
      id,
      division_id,
      role:roles(name, slug, level)
    `)
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = callerAssignment as any;
  const callerRole = a.role;
  const callerLevel = callerRole?.level ?? 0;
  const callerDivisionId = a.division_id;

  if (!callerAssignment || callerLevel < 55) {
    return { error: "Anda tidak memiliki izin untuk mengundang anggota." };
  }

  const fullName = formData.get("full_name") as string;
  const nim = formData.get("nim") as string;
  const email = formData.get("email") as string;
  const roleId = formData.get("role_id") as string;

  if (!fullName || !nim || !email || !roleId) {
    return { error: "Semua field harus diisi." };
  }

  // Validate that the selected role is allowed for this inviter's level
  const { data: targetRole } = await admin
    .from("roles")
    .select("name, slug, level")
    .eq("id", roleId)
    .eq("committee_year_id", YEAR_ID)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!targetRole || (targetRole as any).level >= callerLevel) {
    return { error: "Role yang dipilih tidak valid untuk level Anda." };
  }

  // Check if profile already exists by NIM
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("nim", nim)
    .maybeSingle();

  let profileId: string;

  if (existingProfile) {
    profileId = existingProfile.id;
    // Check if the auth email of this NIM matches the email in the form
    const { data: authUser } = await admin.auth.admin.getUserById(profileId);
    const existingEmail = authUser?.user?.email;

    if (existingEmail && existingEmail.toLowerCase() !== email.toLowerCase()) {
      return { error: `NIM ${nim} sudah terdaftar dengan email yang berbeda (${existingEmail}).` };
    }
  } else {
    // Check if email already exists in auth.users
    let existingAuthUser = null;
    try {
      const { data: listRes } = await admin.auth.admin.listUsers({ perPage: 1000 });
      existingAuthUser = listRes?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
    } catch (err) {
      console.error("Error listing users:", err);
    }

    if (existingAuthUser) {
      profileId = existingAuthUser.id;

      // Check if this existing user already has a profile with a different NIM
      const { data: userProfile } = await admin
        .from("profiles")
        .select("nim")
        .eq("id", profileId)
        .maybeSingle();

      if (userProfile && userProfile.nim !== nim) {
        return { error: `Email ${email} sudah terdaftar dengan NIM yang berbeda (${userProfile.nim}).` };
      }

      // Upsert profile in case it doesn't exist for this user ID
      const { error: profileErr } = await admin.from("profiles").upsert({
        id: profileId,
        full_name: fullName,
        nim,
      });
      if (profileErr) return { error: profileErr.message };
    } else {
      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        email,
        password: "ifest2026",
        email_confirm: true,
        user_metadata: { full_name: fullName, nim },
      });

      if (authErr || !authUser?.user) {
        return { error: authErr?.message ?? "Gagal membuat akun." };
      }

      profileId = authUser.user.id;

      const { error: profileErr } = await admin.from("profiles").upsert({
        id: profileId,
        full_name: fullName,
        nim,
      }).select("id").single();

      if (profileErr) return { error: profileErr.message };
    }
  }

  console.log("[Invite Member] Form Submission:", { fullName, nim, email, roleId });
  console.log("[Invite Member] Resolved profileId:", profileId);

  // Check if already assigned this year
  const { data: existingAssignment } = await admin
    .from("committee_assignments")
    .select("id, is_active")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", profileId)
    .maybeSingle();

  console.log("[Invite Member] Existing assignment:", existingAssignment);

  if (existingAssignment) {
    if (!existingAssignment.is_active) {
      // Reactivate the inactive assignment!
      const { error: reactivateErr } = await admin
        .from("committee_assignments")
        .update({
          is_active: true,
          division_id: callerDivisionId,
          role_id: roleId,
        })
        .eq("id", existingAssignment.id);

      if (reactivateErr) return { error: reactivateErr.message };

      // Send welcome email (fire-and-forget — don't block on failure)
      try {
        const { sendWelcomeEmail } = await import("@/lib/email");
        await sendWelcomeEmail(email, fullName, "ifest2026");
      } catch {}

      revalidatePath("/dashboard/members");
      return { success: true };
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, nim")
      .eq("id", profileId)
      .maybeSingle();

    const { data: authUser } = await admin.auth.admin.getUserById(profileId);
    const matchedEmail = authUser?.user?.email ?? email;

    return { 
      error: `Anggota ini sudah terdaftar di kepanitiaan tahun ini atas nama "${profile?.full_name || "Tidak diketahui"}" (NIM: ${profile?.nim || nim}, Email: ${matchedEmail}).` 
    };
  }

  const { error: assignErr } = await admin.from("committee_assignments").insert({
    committee_year_id: YEAR_ID,
    user_id: profileId,
    division_id: callerDivisionId,
    role_id: roleId,
  });

  if (assignErr) return { error: assignErr.message };

  // Send welcome email (fire-and-forget — don't block on failure)
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(email, fullName, "ifest2026");
  } catch {
    // Email failure is non-critical
  }

  revalidatePath("/dashboard/members");
  return { success: true };
}
