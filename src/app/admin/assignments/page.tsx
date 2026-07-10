import { getAssignments, getDivisionsWithMembers, getRoles } from "@/lib/data/admin-data";
import { AssignmentsClient } from "./client";

export default async function AdminAssignmentsPage() {
  const [assignments, divisions, roles] = await Promise.all([
    getAssignments(),
    getDivisionsWithMembers(),
    getRoles(),
  ]);

  return (
    <AssignmentsClient
      assignments={assignments}
      divisions={divisions.map((d) => ({ id: d.id, name: d.name }))}
      roles={roles.map((r) => ({ id: r.id, name: r.name }))}
    />
  );
}
