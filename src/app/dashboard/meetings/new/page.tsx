import { getAllMembers } from "@/lib/data/members";
import { requirePermission } from "@/lib/auth/authorize";
import { NewMeetingForm } from "./form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewMeetingPage() {
  const auth = await requirePermission("is_meeting_creator");
  if (!auth.authorized) {
    return <div className="text-pink-600 font-mono p-8">{auth.error}</div>;
  }

  const { session } = auth;
  const divisions = await getAllMembers();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <p className="text-pink-500 font-mono text-[11px] font-extrabold tracking-widest uppercase mb-1">
            MEETING PLANNER
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Buat Rapat Baru
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Jadwalkan rapat panitia baru, atur agenda, lokasi, dan undang peserta secara terintegrasi.
          </p>
        </div>

        <Link href="/dashboard/meetings">
          <Button variant="outline" size="sm" className="h-9 rounded-2xl font-mono text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer">
            <ArrowLeft className="size-4" /> Kembali
          </Button>
        </Link>
      </div>

      <NewMeetingForm
        divisions={divisions}
        creatorAssignmentId={session.assignmentId}
        creatorDivisionId={session.divisionId}
        creatorRoleLevel={session.roleLevel}
      />
    </div>
  );
}
