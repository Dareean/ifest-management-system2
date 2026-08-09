"use client";

import { useState } from "react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6 md:p-8">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent-magenta block mb-1">
            STRUKTUR ORGANISASI
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Divisi Kepanitiaan
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant/80 font-normal">
            {divisions.length} divisi aktif terdaftar di kepanitiaan
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="cursor-pointer bg-[#04000D] hover:bg-[#1D1B1D] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm border border-[#04000D] flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
        >
          <Plus className="size-4 text-[#DCEEB1]" />
          Tambah Divisi
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Cari divisi berdasarkan nama atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#04000D]/10 bg-[#FDF8FA] text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#04000D]/30 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-on-surface-variant bg-[#FDF8FA] px-3.5 py-2 rounded-xl border border-[#04000D]/5 select-none">
          <Filter className="size-3.5 text-accent-magenta" />
          <span>Menampilkan <strong className="text-on-surface font-bold">{filteredDivisions.length}</strong> divisi</span>
        </div>
      </div>

      {/* Division Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDivisions.length === 0 ? (
          <div className="bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-12 text-center col-span-full">
            <Building2 className="size-12 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-base font-bold text-on-surface">Divisi Tidak Ditemukan</h3>
            <p className="text-sm text-on-surface-variant/80 mt-1 max-w-sm mx-auto">
              Tidak ada divisi yang cocok dengan pencarian "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredDivisions.map((div) => (
            <div
              key={div.id}
              className="group bg-white border border-[#04000D]/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:border-[#04000D]/15 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#04000D]/5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#04000D] text-[#DCEEB1] shrink-0 group-hover:bg-accent-magenta group-hover:text-white transition-colors duration-200">
                      <Building2 className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface group-hover:text-accent-magenta transition-colors duration-200 truncate" title={div.name}>
                        {div.name}
                      </h3>
                      <p className="text-xs font-mono text-on-surface-variant/70 mt-0.5">{div.slug}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditing(div);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-xl text-on-surface-variant/40 hover:text-accent-magenta hover:bg-accent-magenta/10 transition-colors duration-200 cursor-pointer shrink-0"
                    title="Edit Divisi"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant/80 leading-relaxed line-clamp-2">
                  {div.description || "Tidak ada deskripsi rincian untuk divisi ini."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#04000D]/5 text-[11px] font-mono text-on-surface-variant">
                <span className="inline-flex items-center gap-1 bg-[#FDF8FA] px-2.5 py-1 rounded-lg border border-[#04000D]/5 font-bold uppercase tracking-wider">
                  <Layers className="size-3 text-accent-magenta" /> Urutan #{div.sort_order}
                </span>
                <span className="font-bold uppercase tracking-wider text-[#1D1B1D] bg-[#DCEEB1]/40 px-2.5 py-1 rounded-lg border border-[#DCEEB1]/60">
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
