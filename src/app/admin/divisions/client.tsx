"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Building2, Search, Filter, Layers } from "lucide-react";
import { DivisionFormModal } from "@/components/admin/forms";
import type { DivisionWithMembers } from "@/lib/data/admin-data";

export function DivisionClient({ divisions }: { divisions: DivisionWithMembers[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DivisionWithMembers | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDivisions = divisions.filter((div) => {
    return (
      div.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (div.description && div.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-outline-variant/20 rounded-3xl p-6">
        <div>
          <p className="text-primary font-mono text-xs font-bold tracking-widest uppercase mb-1">
            STRUKTUR ORGANISASI
          </p>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-sans">Divisi Kepanitiaan</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-medium">
            {divisions.length} divisi aktif terdaftar di kepanitiaan
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="cursor-pointer font-sans text-sm font-bold gap-2 px-5 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="size-4.5" />
          Tambah Divisi
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Cari divisi berdasarkan nama atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/30">
          <Filter className="size-3.5" />
          <span>Menampilkan {filteredDivisions.length} divisi</span>
        </div>
      </div>

      {/* Division Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDivisions.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center col-span-full shadow-sm">
            <Building2 className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Divisi Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada divisi yang cocok dengan pencarian "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredDivisions.map((div) => (
            <div
              key={div.id}
              className="group bg-white border border-outline-variant/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      <Building2 className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors duration-200 truncate" title={div.name}>
                        {div.name}
                      </h3>
                      <p className="text-[11px] font-mono text-on-surface-variant/70 mt-0.5">{div.slug}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditing(div);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all duration-200 cursor-pointer shrink-0 border border-transparent hover:border-outline-variant/40"
                    title="Edit Divisi"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant font-sans leading-relaxed line-clamp-2">
                  {div.description || "Tidak ada deskripsi rincian untuk divisi ini."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 text-[11px] font-mono text-on-surface-variant">
                <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant/30 font-bold">
                  <Layers className="size-3" /> Urutan #{div.sort_order}
                </span>
                <span className="font-extrabold text-on-surface bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                  {div.members} anggota
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Division Form Modal */}
      <DivisionFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                slug: editing.slug,
                description: editing.description,
                sort_order: editing.sort_order,
              }
            : null
        }
      />
    </div>
  );
}
