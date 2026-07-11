import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export interface PersonalData {
  userId: string | null;
  assignment: {
    id: string;
    division: string;
    divisionId: string;
    role: string;
  } | null;
  kpis: {
    id: string;
    title: string;
    target: string;
    deadline: string | null;
    isMilestone: boolean;
    progress: number;
  }[];
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string | null;
    kpi: string;
  }[];
  letters: {
    id: string;
    subject: string;
    status: string;
    createdAt: string;
  }[];
  meetings: {
    id: string;
    title: string;
    startedAt: string;
    meetingType: string;
    rsvpStatus: string;
  }[];
}

// ── Lightweight fetchers for granular Suspense streaming ──

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

export async function getCurrentAssignment(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("committee_assignments")
    .select("id, division_id, role:roles(name, slug, level), division:divisions(id, name)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;
  const a = data as any;
  return {
    id: a.id,
    divisionId: a.division_id,
    divisionName: a.division?.name ?? "",
    roleName: a.role?.name ?? "",
    roleSlug: a.role?.slug ?? "",
    roleLevel: a.role?.level ?? 0,
  };
}

export async function getUserTasks(assignmentId: string) {
  const admin = createAdminClient();
  const { data: userAssignments } = await admin
    .from("committee_assignments")
    .select("division_id")
    .eq("id", assignmentId)
    .single();

  if (!userAssignments) return [];
  const divisionId = (userAssignments as any).division_id;

  const { data: kpis } = await admin
    .from("kpi_items")
    .select("id, title")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId);

  const kpiIds = kpis?.map((k) => k.id) ?? [];
  if (kpiIds.length === 0) return [];

  const { data: tasks } = await admin
    .from("tasks")
    .select("id, title, status, priority, deadline, kpi_item_id")
    .in("kpi_item_id", kpiIds)
    .order("created_at");

  return (tasks ?? []).map((t: any) => {
    const kpi = kpis?.find((k) => k.id === t.kpi_item_id);
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      kpi: kpi?.title ?? "",
    };
  });
}

export async function getUserMeetings(assignmentId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("meeting_invitees")
    .select(`
      id, rsvp_status,
      meeting:meetings(id, title, started_at, meeting_type)
    `)
    .eq("committee_assignment_id", assignmentId)
    .order("meeting_id", { ascending: false })
    .limit(5);

  return (data ?? []).map((m: any) => ({
    id: m.meeting?.id ?? "",
    title: m.meeting?.title ?? "",
    startedAt: m.meeting?.started_at ?? "",
    meetingType: m.meeting?.meeting_type ?? "scheduled",
    rsvpStatus: m.rsvp_status,
  }));
}

export async function getUserLetters(assignmentId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("letter_requests")
    .select("id, subject, status, created_at")
    .eq("committee_year_id", YEAR_ID)
    .eq("requester_id", assignmentId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []).map((l: any) => ({
    id: l.id,
    subject: l.subject,
    status: l.status,
    createdAt: l.created_at,
  }));
}

export async function getPersonalDashboard(): Promise<PersonalData> {
  // Try to get the current user from the auth session
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id ?? null;

  if (!userId) {
    return {
      userId: null,
      assignment: null,
      kpis: [],
      tasks: [],
      letters: [],
      meetings: [],
    };
  }

  const admin = createAdminClient();

  // Get the user's committee assignment for this year
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, division_id, role:roles(name), division:divisions(id, name)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) {
    return {
      userId,
      assignment: null,
      kpis: [],
      tasks: [],
      letters: [],
      meetings: [],
    };
  }

  const assignmentData = assignment as any;
  const divisionId = assignmentData.division_id;
  const assignmentId = assignmentData.id;

  // Fetch KPIs for the user's division
  const { data: kpis } = await admin
    .from("kpi_items")
    .select("id, title, target, deadline, is_milestone")
    .eq("committee_year_id", YEAR_ID)
    .eq("division_id", divisionId);

  // Fetch tasks for each KPI
  const kpiIds = kpis?.map((k) => k.id) ?? [];
  const { data: tasks } = kpiIds.length > 0
    ? await admin
        .from("tasks")
        .select("id, title, status, priority, deadline, kpi_item_id")
        .in("kpi_item_id", kpiIds)
        .order("created_at")
    : { data: [] };

  const taskList = (tasks ?? []).map((t: any) => {
    const kpi = kpis?.find((k) => k.id === t.kpi_item_id);
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      kpi: kpi?.title ?? "",
    };
  });

  // Calculate KPI progress
  const kpiList = (kpis ?? []).map((kpi) => {
    const kpiTasks = (tasks ?? []).filter((t: any) => t.kpi_item_id === kpi.id);
    const done = kpiTasks.filter((t: any) => t.status === "done").length;
    return {
      id: kpi.id,
      title: kpi.title,
      target: kpi.target,
      deadline: kpi.deadline,
      isMilestone: kpi.is_milestone,
      progress: kpiTasks.length > 0 ? Math.round((done / kpiTasks.length) * 100) : 0,
    };
  });

  // Fetch user's letter requests
  const { data: letters } = await admin
    .from("letter_requests")
    .select("id, subject, status, created_at")
    .eq("committee_year_id", YEAR_ID)
    .eq("requester_id", assignmentId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch meetings for this year (where user is invited)
  const { data: meetings } = await admin
    .from("meeting_invitees")
    .select(`
      id,
      rsvp_status,
      meeting:meetings(id, title, started_at, meeting_type)
    `)
    .eq("committee_assignment_id", assignmentId)
    .order("meeting_id", { ascending: false })
    .limit(5);

  const personalData: PersonalData = {
    userId,
    assignment: {
      id: assignmentData.id,
      division: assignmentData.division?.name ?? "",
      divisionId: assignmentData.division?.id ?? "",
      role: assignmentData.role?.name ?? "",
    },
    kpis: kpiList,
    tasks: taskList,
    letters: (letters ?? []).map((l: any) => ({
      id: l.id,
      subject: l.subject,
      status: l.status,
      createdAt: l.created_at,
    })),
    meetings: (meetings ?? []).map((m: any) => ({
      id: m.meeting?.id ?? "",
      title: m.meeting?.title ?? "",
      startedAt: m.meeting?.started_at ?? "",
      meetingType: m.meeting?.meeting_type ?? "scheduled",
      rsvpStatus: m.rsvp_status,
    })),
  };

  return personalData;
}
