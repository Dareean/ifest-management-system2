"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Shield } from "lucide-react";
import { RoleFormModal } from "@/components/admin/forms";
import type { RoleData } from "@/lib/data/admin-data";

export function RolesClient({ roles }: { roles: RoleData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleData | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Role & Jabatan</h2>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="cursor-pointer">
          <Plus className="size-4" />
          Tambah Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.length === 0 && (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center col-span-full">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada role ditambahkan.</p>
          </div>
        )}
        {roles.map((role) => (
          <Card key={role.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/20 transition-all">
            <CardHeader className="p-0">
              <div className="flex items-start justify-between gap-4 mb-3 pb-3 border-b border-outline-variant/10">
                <div>
                  <CardTitle className="text-base font-bold text-on-surface">{role.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono">Level {role.level}</Badge>
                  <button
                    onClick={() => { setEditing(role); setShowForm(true); }}
                    className="p-1.5 rounded hover:bg-surface-container border border-transparent hover:border-outline-variant/20 transition-all cursor-pointer"
                    title="Edit Role"
                  >
                    <Pencil className="size-4 text-on-surface-variant" />
                  </button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-1.5 flex-wrap">
                {role.is_approver && <Badge variant="info" className="text-[9px] font-mono px-2 py-0.5">Approver</Badge>}
                {role.is_meeting_creator && <Badge variant="warning" className="text-[9px] font-mono px-2 py-0.5">Meeting Creator</Badge>}
                {!role.is_approver && !role.is_meeting_creator && (
                  <span className="text-xs text-on-surface-variant font-sans">Anggota reguler</span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <RoleFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        initial={editing ? {
          id: editing.id,
          name: editing.name,
          slug: editing.slug,
          level: editing.level,
          is_approver: editing.is_approver,
          is_meeting_creator: editing.is_meeting_creator,
        } : null}
      />
    </div>
  );
}
