"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function requireActiveMember() {
  const auth = await createClient();
  const { data: authData } = await auth.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return null;

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, division_id, role:roles(name, slug, level, is_approver)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return null;
  return assignment as any;
}

async function requireAdmin(level: number) {
  const member = await requireActiveMember();
  if (!member) return null;
  if ((member.role?.level ?? 0) < level) return null;
  return member;
}

// ============================================================
// Divisions
// ============================================================

export async function createDivision(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase.from("divisions").insert({
    committee_year_id: YEAR_ID,
    name,
    slug,
    description: description || null,
    sort_order: sortOrder,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/divisions");
  return { success: true };
}

export async function updateDivision(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase
    .from("divisions")
    .update({ name, slug, description: description || null, sort_order: sortOrder })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/divisions");
  return { success: true };
}

export async function deleteDivision(id: string) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("divisions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/divisions");
  return { success: true };
}

// ============================================================
// Roles
// ============================================================

export async function createRole(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const level = parseInt(formData.get("level") as string) || 50;
  const isApprover = formData.get("is_approver") === "on";
  const isMeetingCreator = formData.get("is_meeting_creator") === "on";
  const isReportCreator = formData.get("is_report_creator") === "on";

  const { error } = await supabase.from("roles").insert({
    committee_year_id: YEAR_ID,
    name,
    slug,
    level,
    is_approver: isApprover,
    is_meeting_creator: isMeetingCreator,
    is_report_creator: isReportCreator,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/roles");
  return { success: true };
}

export async function updateRole(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const level = parseInt(formData.get("level") as string) || 50;
  const isApprover = formData.get("is_approver") === "on";
  const isMeetingCreator = formData.get("is_meeting_creator") === "on";
  const isReportCreator = formData.get("is_report_creator") === "on";

  const { error } = await supabase
    .from("roles")
    .update({ 
      name, 
      slug, 
      level, 
      is_approver: isApprover, 
      is_meeting_creator: isMeetingCreator,
      is_report_creator: isReportCreator,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/roles");
  return { success: true };
}

export async function deleteRole(id: string) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/roles");
  return { success: true };
}

// ============================================================
// Committee Years
// ============================================================

export async function createYear(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(90);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const label = formData.get("label") as string;
  const startedAt = formData.get("started_at") as string;
  const endedAt = formData.get("ended_at") as string;
  const copyFrom = formData.get("copy_from") as string;

  const { data: newYear, error } = await supabase
    .from("committee_years")
    .insert({
      label,
      started_at: startedAt,
      ended_at: endedAt || null,
      is_active: false,
    })
    .select("id")
    .single();

  if (error || !newYear) return { error: error?.message ?? "Failed to create year" };

  if (copyFrom) {
    const [divs, roles] = await Promise.all([
      supabase.from("divisions").select("*").eq("committee_year_id", copyFrom),
      supabase.from("roles").select("*").eq("committee_year_id", copyFrom),
    ]);

    if (divs.data) {
      const { error: divErr } = await supabase.from("divisions").insert(
        divs.data.map((d: any) => ({
          committee_year_id: newYear.id,
          name: d.name,
          slug: d.slug,
          description: d.description,
          sort_order: d.sort_order,
        })),
      );
      if (divErr) console.error("Copy divisions error:", divErr);
    }

    if (roles.data) {
      const { error: roleErr } = await supabase.from("roles").insert(
        roles.data.map((r: any) => ({
          committee_year_id: newYear.id,
          name: r.name,
          slug: r.slug,
          level: r.level,
          is_approver: r.is_approver,
          is_meeting_creator: r.is_meeting_creator,
        })),
      );
      if (roleErr) console.error("Copy roles error:", roleErr);
    }
  }

  revalidatePath("/admin/years");
  return { success: true };
}

// ============================================================
// Committee Assignments
// ============================================================

export async function createAssignment(prevState: unknown, formData: FormData) {
  const caller = await requireAdmin(75);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const divisionId = formData.get("division_id") as string;
  const roleId = formData.get("role_id") as string;
  const fullName = formData.get("full_name") as string;
  const nim = formData.get("nim") as string;
  const email = formData.get("email") as string;

  if (!divisionId || !roleId || !fullName || !nim || !email) {
    return { error: "Semua field harus diisi" };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("nim", nim)
    .maybeSingle();

  let profileId: string;

  if (existing) {
    profileId = existing.id;
  } else {
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: "ifest2026",
      email_confirm: true,
      user_metadata: { full_name: fullName, nim },
    });

    if (authErr || !authUser?.user) {
      return { error: authErr?.message ?? "Gagal membuat akun" };
    }

    profileId = authUser.user.id;
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: profileId,
      full_name: fullName,
      nim,
    }).select("id").single();

    if (profileErr) return { error: profileErr.message };
  }

  const { data: existingAssignment } = await supabase
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", profileId)
    .maybeSingle();

  if (existingAssignment) {
    return { error: "User sudah memiliki assignment di tahun ini" };
  }

  const { error: assignErr } = await supabase.from("committee_assignments").insert({
    committee_year_id: YEAR_ID,
    user_id: profileId,
    division_id: divisionId,
    role_id: roleId,
  });

  if (assignErr) return { error: assignErr.message };

  revalidatePath("/admin/assignments");
  return { success: true };
}

export async function deleteAssignment(id: string) {
  const caller = await requireAdmin(75);
  if (!caller) return { error: "Akses ditolak" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("committee_assignments").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/assignments");
  return { success: true };
}