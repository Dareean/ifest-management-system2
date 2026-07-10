"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users } from "lucide-react";
import { AssignmentFormModal } from "@/components/admin/forms";
import { deleteAssignment } from "@/lib/actions/admin";
import type { AssignmentData } from "@/lib/data/admin-data";

export function AssignmentsClient({
  assignments,
  divisions,
  roles,
}: {
  assignments: AssignmentData[];
  divisions: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}) {
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(id: string) {
    if (confirm("Hapus personel ini?")) {
      await deleteAssignment(id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Assign Personel</h2>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)} className="cursor-pointer">
          <Plus className="size-4" />
          Assign Personel
        </Button>
      </div>

      <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50">
                <th className="pb-3 pr-4 caption text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nama</th>
                <th className="pb-3 pr-4 caption text-xs font-bold text-on-surface-variant uppercase tracking-wider">NIM</th>
                <th className="pb-3 pr-4 caption text-xs font-bold text-on-surface-variant uppercase tracking-wider">Divisi</th>
                <th className="pb-3 pr-4 caption text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="pb-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-on-surface-variant font-mono text-sm">
                    Belum ada personel ditugaskan.
                  </td>
                </tr>
              )}
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-surface-container/20 transition-colors">
                  <td className="py-4 pr-4 text-sm font-bold text-on-surface">{a.name}</td>
                  <td className="py-4 pr-4 text-xs font-mono text-on-surface-variant">{a.nim}</td>
                  <td className="py-4 pr-4">
                    <Badge variant="info" className="text-[10px] font-mono px-2 py-0.5">{a.division}</Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">{a.role}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded hover:bg-error-container/20 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                      title="Hapus Personel"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssignmentFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        divisions={divisions}
        roles={roles}
      />
    </div>
  );
}
