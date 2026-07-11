import { notFound, redirect } from "next/navigation";
import { getLetterDetail } from "@/lib/data/letter-detail";
import { LetterDetailClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

export default async function LetterDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const letter = await getLetterDetail(id);

  if (!letter) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) redirect("/login");

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("committee_assignments")
    .select("id, role:roles(is_approver)")
    .eq("committee_year_id", YEAR_ID)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  const isApprover = !!(assignment as any)?.role?.is_approver;

  return <LetterDetailClient letter={letter} isApprover={isApprover} />;
}
