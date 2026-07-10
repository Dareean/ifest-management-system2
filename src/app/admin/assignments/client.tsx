"use client";

import { useState } from "react";
import { ColorBlock } from "@/components/blocks/color-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Assign Personel
        </Button>
      </div>

      <ColorBlock color="pink">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="pb-sm pr-md caption text-on-surface-variant">Nama</th>
                <th className="pb-sm pr-md caption text-on-surface-variant">NIM</th>
                <th className="pb-sm pr-md caption text-on-surface-variant">Divisi</th>
                <th className="pb-sm pr-md caption text-on-surface-variant">Role</th>
                <th className="pb-sm caption text-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-md text-center text-on-surface-variant caption">
                    Belum ada personel. Assign personel melalui menu di atas.
                  </td>
                </tr>
              )}
              {assignments.map((a) => (
                <tr key={a.id} className="border-b border-outline-variant/50 last:border-0">
                  <td className="py-sm pr-md font-medium">{a.name}</td>
                  <td className="py-sm pr-md caption text-on-surface-variant">{a.nim}</td>
                  <td className="py-sm pr-md">
                    <Badge variant="info">{a.division}</Badge>
                  </td>
                  <td className="py-sm pr-md">
                    <Badge variant="secondary">{a.role}</Badge>
                  </td>
                  <td className="py-sm">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ColorBlock>

      <AssignmentFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        divisions={divisions}
        roles={roles}
      />
    </div>
  );
}
