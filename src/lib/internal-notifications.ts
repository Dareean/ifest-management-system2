import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

async function sendEmailForNotification(
  assignmentId: string,
  type: string,
  title: string,
  body?: string,
) {
  try {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData }: any = await admin
      .from("committee_assignments")
      .select("user:profiles!inner(full_name), user_id")
      .eq("id", assignmentId)
      .single();

    const fullName = userData?.user?.full_name ?? "";
    const profileId = userData?.user_id;

    if (!profileId) return;

    const { data: authUser } = await admin.auth.admin.getUserById(profileId);
    const email = authUser?.user?.email;

    if (!email) return;

    const { sendEmailNotification } = await import("@/lib/email");
    let html = `<p>Halo <strong>${fullName}</strong>,</p><p>${body ?? title}</p>`;
    if (type === "task") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Ada tugas baru untuk Anda:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    } else if (type === "letter") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Pembaruan surat:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    } else if (type === "meeting") {
      html = `<p>Halo <strong>${fullName}</strong>,</p><p>Undangan rapat:</p><p><strong>${title}</strong></p>${body ? `<p>${body}</p>` : ""}`;
    }

    const emailErr = await sendEmailNotification(email, fullName, `[${type.toUpperCase()}] ${title}`, html);
    if (emailErr) console.error("[Notification] Email error:", emailErr);
  } catch (e) {
    console.error("[Notification] Unexpected email error:", e);
  }
}

async function sendWhatsAppForNotification(
  assignmentId: string,
  type: string,
  title: string,
  body?: string,
) {
  try {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData }: any = await admin
      .from("committee_assignments")
      .select("user:profiles!inner(full_name, phone), user_id")
      .eq("id", assignmentId)
      .single();

    const fullName = userData?.user?.full_name ?? "";
    const phone = userData?.user?.phone;

    if (!phone) return; // No phone number, skip WhatsApp

    const { sendWhatsAppMessage, formatWhatsAppMessage } = await import("@/lib/fonnte");

    // Format message based on notification type
    let message = "";
    if (type === "task") {
      message = formatWhatsAppMessage({
        title: "📋 Tugas Baru",
        body: `Halo ${fullName},\n\nAnda memiliki tugas baru:\n*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else if (type === "letter") {
      message = formatWhatsAppMessage({
        title: "📄 Pembaruan Surat",
        body: `Halo ${fullName},\n\n*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else if (type === "meeting") {
      message = formatWhatsAppMessage({
        title: "📅 Undangan Rapat",
        body: `Halo ${fullName},\n\n*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else {
      message = formatWhatsAppMessage({
        title: title,
        body: `Halo ${fullName},\n\n${body ?? title}`,
        footer: "I-FEST Management System",
      });
    }

    await sendWhatsAppMessage({ phone, message });
  } catch {
    // WhatsApp failure is non-critical
  }
}

async function sendWhatsAppToGroup(
  groupId: string,
  type: string,
  title: string,
  body?: string,
) {
  try {
    const { sendWhatsAppMessage, formatWhatsAppMessage } = await import("@/lib/fonnte");

    // Format message based on notification type (no personalization for group)
    let message = "";
    if (type === "task") {
      message = formatWhatsAppMessage({
        title: "📋 Tugas Baru",
        body: `*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else if (type === "letter") {
      message = formatWhatsAppMessage({
        title: "📄 Pembaruan Surat",
        body: `*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else if (type === "meeting") {
      message = formatWhatsAppMessage({
        title: "📅 Undangan Rapat",
        body: `*${title}*${body ? `\n\n${body}` : ""}`,
        footer: "I-FEST Management System",
      });
    } else {
      message = formatWhatsAppMessage({
        title: title,
        body: body ?? title,
        footer: "I-FEST Management System",
      });
    }

    // For group, use groupId as the "phone" parameter
    await sendWhatsAppMessage({ phone: groupId, message });
  } catch {
    // WhatsApp group failure is non-critical
  }
}

export async function createNotification(
  assignmentId: string,
  type: string,
  title: string,
  body?: string,
  urgent: boolean = false,
) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    committee_assignment_id: assignmentId,
    type,
    title,
    body: body ?? null,
  });

  // Send email only if urgent (letter, meeting, deadlines)
  if (urgent) {
    sendEmailForNotification(assignmentId, type, title, body);
  }

  // WhatsApp always sent (fire and forget)
  sendWhatsAppForNotification(assignmentId, type, title, body);
}

export async function notifyDivision(
  divisionId: string,
  type: string,
  title: string,
  body?: string,
  urgent: boolean = false,
) {
  const admin = createAdminClient();

  // Get division info including whatsapp_group_id
  const { data: division } = await admin
    .from("divisions")
    .select("whatsapp_group_id")
    .eq("id", divisionId)
    .single();

  const groupId = division?.whatsapp_group_id;

  // Get all members for in-app notifications and email
  const { data: members } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId)
    .eq("is_active", true);

  if (members) {
    // Insert in-app notifications for all members
    await admin.from("notifications").insert(
      members.map((m) => ({
        committee_assignment_id: m.id,
        type,
        title,
        body: body ?? null,
      })),
    );

    // Send email only if urgent
    if (urgent) {
      for (const m of members) {
        sendEmailForNotification(m.id, type, title, body);
      }
    }

    // WhatsApp: If group_id exists, send ONE message to group
    // Otherwise, fallback to sending to each member individually
    if (groupId) {
      sendWhatsAppToGroup(groupId, type, title, body);
    } else {
      for (const m of members) {
        sendWhatsAppForNotification(m.id, type, title, body);
      }
    }
  }
}

export async function notifyAllMembers(
  type: string,
  title: string,
  body?: string,
  urgent: boolean = false,
) {
  const admin = createAdminClient();

  // Get all active members
  const { data: members } = await admin
    .from("committee_assignments")
    .select("id")
    .eq("committee_year_id", YEAR_ID)
    .eq("is_active", true);

  if (members) {
    // Insert in-app notifications for all members
    await admin.from("notifications").insert(
      members.map((m) => ({
        committee_assignment_id: m.id,
        type,
        title,
        body: body ?? null,
      })),
    );

    // Send email only if urgent
    if (urgent) {
      for (const m of members) {
        sendEmailForNotification(m.id, type, title, body);
      }
    }

    // WhatsApp: Get all divisions with group_id and send to each group
    const { data: divisionsWithGroup } = await admin
      .from("divisions")
      .select("whatsapp_group_id")
      .eq("committee_year_id", YEAR_ID)
      .not("whatsapp_group_id", "is", null);

    if (divisionsWithGroup && divisionsWithGroup.length > 0) {
      // Send to each division's group (broadcast to all groups)
      for (const division of divisionsWithGroup) {
        if (division.whatsapp_group_id) {
          sendWhatsAppToGroup(division.whatsapp_group_id, type, title, body);
        }
      }
    } else {
      // Fallback: send to each member individually if no groups configured
      for (const m of members) {
        sendWhatsAppForNotification(m.id, type, title, body);
      }
    }
  }
}
