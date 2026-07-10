"use client";

import { useState } from "react";
import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DivisionFormModal } from "@/components/admin/forms";
import type { DivisionWithMembers } from "@/lib/data/admin-data";

export function DivisionClient({ divisions }: { divisions: DivisionWithMembers[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DivisionWithMembers | null>(null);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-on-surface-variant">I-FEST 2026</p>
        <Button variant="outline" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="size-4" />
          Tambah Divisi
        </Button>
      </div>

      <ColorBlock color="pink">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {divisions.map((div) => (
            <Card key={div.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{div.name}</CardTitle>
                  <div className="flex gap-xs">
                    <button
                      onClick={() => { setEditing(div); setShowForm(true); }}
                      className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <Pencil className="size-4 text-on-surface-variant" />
                    </button>
                  </div>
                </div>
                <CardDescription>
                  {div.members} anggota &middot; {div.description ?? div.slug}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ColorBlock>

      <DivisionFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        initial={editing ? { id: editing.id, name: editing.name, slug: editing.slug, description: editing.description, sort_order: editing.sort_order } : null}
      />
    </div>
  );
}
