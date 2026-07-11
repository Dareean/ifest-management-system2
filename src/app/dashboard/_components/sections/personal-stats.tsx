import { getUserMeetings, getUserTasks } from "@/lib/data/personal-dashboard";
import { Badge } from "@/components/ui/badge";

export async function PersonalStats({ assignmentId }: { assignmentId: string }) {
  const [tasks, meetings] = await Promise.all([
    getUserTasks(assignmentId),
    getUserMeetings(assignmentId),
  ]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const pendingRsvp = meetings.filter((m) => m.rsvpStatus === "pending").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TOTAL TASK</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">{totalTasks}</p>
        <p className="text-xs text-on-surface-variant font-mono">Tugas Anda</p>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">TASK SELESAI</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">{doneTasks} / {totalTasks}</p>
        <p className="text-xs text-on-surface-variant font-mono">Pekerjaan rampung</p>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-6">
        <p className="text-xs font-mono font-bold tracking-wider text-on-surface-variant uppercase">RAPAT BARU</p>
        <p className="text-4xl font-black text-on-surface my-2 leading-none">{pendingRsvp}</p>
        <p className="text-xs text-on-surface-variant font-mono">Belum direspon</p>
      </div>
    </div>
  );
}
