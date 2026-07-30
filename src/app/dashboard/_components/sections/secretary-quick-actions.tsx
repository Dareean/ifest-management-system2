import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calendar, Mail, ClipboardCheck, Sparkles } from "lucide-react";

export function SecretaryQuickActions() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
            Aksi Cepat Sekretaris
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Pintasan cepat untuk mengelola permohonan surat, membuat rapat, dan memeriksa berkas.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
        <Link href="/dashboard/letters/new" className="flex-1 sm:flex-none">
          <Button variant="primary" size="sm" className="w-full h-9 text-xs font-mono font-bold uppercase gap-1.5 cursor-pointer bg-slate-900 text-white hover:bg-black rounded-xl">
            <Plus className="size-4" /> Ajukan Surat
          </Button>
        </Link>

        <Link href="/dashboard/meetings/new" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full h-9 text-xs font-mono font-bold uppercase gap-1.5 cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
            <Calendar className="size-4 text-pink-500" /> Buat Rapat
          </Button>
        </Link>

        <Link href="/dashboard/letters" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full h-9 text-xs font-mono font-bold uppercase gap-1.5 cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
            <Mail className="size-4 text-emerald-500" /> Kelola Surat
          </Button>
        </Link>

        <Link href="/dashboard/weekly-report" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full h-9 text-xs font-mono font-bold uppercase gap-1.5 cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
            <ClipboardCheck className="size-4 text-amber-500" /> Laporan
          </Button>
        </Link>
      </div>
    </div>
  );
}
