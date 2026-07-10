import { getAllMembers } from "@/lib/data/members";
import { requireRole } from "@/lib/auth/authorize";
import { NewMeetingForm } from "./form";

export default async function NewMeetingPage() {
  const auth = await requireRole(55);
  if (!auth.authorized) {
    return <div className="text-error p-8">{auth.error}</div>;
  }

  const { session } = auth;
  const divisions = await getAllMembers();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <p className="text-accent-magenta font-mono text-xs font-bold tracking-widest uppercase mb-1">
          Meeting Planner
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          Buat Rapat Baru
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          Jadwalkan rapat panitia baru, atur agenda, lokasi, dan undang peserta secara terintegrasi.
        </p>
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
