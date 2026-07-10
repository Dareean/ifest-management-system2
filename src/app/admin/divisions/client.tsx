"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Building2 } from "lucide-react";
import { DivisionFormModal } from "@/components/admin/forms";
import type { DivisionWithMembers } from "@/lib/data/admin-data";

export function DivisionClient({ divisions }: { divisions: DivisionWithMembers[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DivisionWithMembers | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Divisi Kepanitiaan</h2>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="cursor-pointer">
          <Plus className="size-4" />
          Tambah Divisi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.length === 0 && (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 text-center col-span-full">
            <p className="text-sm font-mono text-on-surface-variant">Belum ada divisi ditambahkan.</p>
          </div>
        )}
        {divisions.map((div) => (
          <Card key={div.id} className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/20 transition-all group">
            <CardHeader className="p-0">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base font-bold text-on-surface">{div.name}</CardTitle>
                <button
                  onClick={() => { setEditing(div); setShowForm(true); }}
                  className="p-1.5 rounded hover:bg-surface-container border border-transparent hover:border-outline-variant/20 transition-all cursor-pointer shrink-0"
                  title="Edit Divisi"
                >
                  <Pencil className="size-4 text-on-surface-variant" />
                </button>
              </div>
              <CardDescription className="text-sm text-on-surface-variant font-sans mt-2">
                {div.description ?? div.slug}
              </CardDescription>
            </CardHeader>
            <div className="border-t border-outline-variant/20 pt-3 mt-4 flex items-center justify-between text-xs font-mono text-on-surface-variant">
              <span>Sort Order: {div.sort_order}</span>
              <span className="font-bold text-on-surface">{div.members} anggota</span>
            </div>
          </Card>
        ))}
      </div>

      <DivisionFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        initial={editing ? { id: editing.id, name: editing.name, slug: editing.slug, description: editing.description, sort_order: editing.sort_order } : null}
      />
    </div>
  );
}
