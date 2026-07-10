import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail } from "lucide-react";
import Link from "next/link";
import { getLetters, getStatusDisplay } from "@/lib/data/letters";
import { exportLettersCSV } from "@/lib/actions/export";
import { ExportButton } from "@/components/export-button";

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[#FF3D8B] font-mono text-xs font-bold tracking-widest uppercase mb-1">
            Sistem Surat
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            Permohonan Surat
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">
            Ajukan dan tinjau status surat keluar divisi Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 sm:self-end">
          <ExportButton label="Export CSV" filename="surat" fetchCsv={exportLettersCSV} />
          <Link href="/dashboard/letters/new">
            <Button className="cursor-pointer">
              <Plus className="size-4" />
              Ajukan Surat
            </Button>
          </Link>
        </div>
      </div>

      {/* Main List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-[#ba1a1a]" />
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Daftar Permohonan</h2>
        </div>

        {letters.length === 0 ? (
          <div className="bg-white border border-outline-variant/60 rounded-2xl p-10 text-center">
            <p className="text-sm font-mono text-on-surface-variant mb-4">
              Belum ada permohonan surat. Klik "Ajukan Surat" untuk memulai.
            </p>
            <Link href="/dashboard/letters/new">
              <Button variant="outline" className="cursor-pointer">
                <Plus className="size-4" /> Ajukan Sekarang
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {letters.map((letter) => {
              const status = getStatusDisplay(letter.status);
              return (
                <Link href={`/dashboard/letters/${letter.id}`} key={letter.id} className="block group">
                  <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-[#FF3D8B]/50 transition-all">
                    <div className="min-w-0">
                      <h3 className="font-sans text-lg font-bold text-on-surface group-hover:text-[#FF3D8B] transition-colors leading-tight">
                        {letter.subject}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-mono mt-1">
                        {letter.letterType.toUpperCase()} &middot; {letter.division} &middot; {letter.requester} &middot;{" "}
                        {new Date(letter.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="text-xs font-mono px-3 py-1 self-start sm:self-center shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
