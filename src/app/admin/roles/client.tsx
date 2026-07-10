"use client";

import { useState } from "react";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { RoleFormModal } from "@/components/admin/forms";
import type { RoleData } from "@/lib/data/admin-data";

export function RolesClient({ roles }: { roles: RoleData[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoleData | null>(null);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <Button variant="outline" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="size-4" />
          Tambah Role
        </Button>
      </div>

      <ColorBlock color="pink">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{role.name}</CardTitle>
                  <div className="flex items-center gap-xs">
                    <Badge variant="outline">Level {role.level}</Badge>
                    <button
                      onClick={() => { setEditing(role); setShowForm(true); }}
                      className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <Pencil className="size-4 text-on-surface-variant" />
                    </button>
                  </div>
                </div>
                <CardDescription>
                  {role.is_approver && <Badge variant="info" className="mr-xs">Approver</Badge>}
                  {role.is_meeting_creator && <Badge variant="warning">Meeting Creator</Badge>}
                  {!role.is_approver && !role.is_meeting_creator && "Anggota reguler"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

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
