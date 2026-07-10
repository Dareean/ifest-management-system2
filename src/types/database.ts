export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CommitteeYear = {
  id: string;
  label: string;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type Division = {
  id: string;
  committee_year_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Role = {
  id: string;
  committee_year_id: string;
  name: string;
  slug: string;
  level: number;
  is_approver: boolean;
  is_meeting_creator: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  nim: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type CommitteeAssignment = {
  id: string;
  committee_year_id: string;
  user_id: string;
  division_id: string;
  role_id: string;
  is_active: boolean;
  assigned_at: string;
};

export type LetterRequest = {
  id: string;
  committee_year_id: string;
  requester_id: string;
  current_handler_id: string | null;
  division_id: string;
  letter_type: string;
  subject: string;
  body: string;
  status: "requested" | "in_revision" | "approved" | "sent";
  revision_count: number;
  final_document_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  committee_year_id: string;
  creator_id: string;
  title: string;
  agenda: string | null;
  meeting_type: "scheduled" | "adhoc";
  meeting_link: string | null;
  location: string | null;
  attachment_url: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type MeetingNote = {
  id: string;
  meeting_id: string;
  writer_id: string;
  content: string;
  decision_points: Json | null;
  action_items: Json | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type KpiItem = {
  id: string;
  committee_year_id: string;
  division_id: string;
  title: string;
  target: string;
  deadline: string | null;
  is_milestone: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  committee_year_id: string;
  kpi_item_id: string | null;
  division_id: string;
  assignee_id: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
