"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WeeklyReport } from "@/types/weekly-report";
import { submitWeeklyReport } from "@/lib/actions/weekly-report";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, FileText, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface WeeklyReportCreateClientProps {
  session: any;
  divisions: { id: string; name: string }[];
  existingReport: WeeklyReport | null;
}

const WEEKS = [
  "Juli W4",
  "Agustus W1",
  "Agustus W2",
  "Agustus W3",
  "Agustus W4",
  "September W1",
  "September W2",
  "September W3",
  "September W4",
  "Oktober W1",
  "Oktober W2",
  "Oktober W3",
  "Oktober W4",
  "November W1",
  "November W2",
  "November W3",
  "November W4"
];

export function WeeklyReportCreateClient({
  session,
  divisions,
  existingReport
}: WeeklyReportCreateClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [divisionId, setDivisionId] = useState(
    existingReport 
      ? divisions.find(d => d.name.toLowerCase() === existingReport.division.toLowerCase() || d.name === existingReport.division)?.id || divisions[0]?.id
      : session.roleLevel >= 75 ? divisions[0]?.id : session.divisionId
  );
  const [weekLabel, setWeekLabel] = useState(existingReport?.weekLabel || "Agustus W1");
  const [achievements, setAchievements] = useState(existingReport?.achievements || "");
  const [blockers, setBlockers] = useState(existingReport?.blockers || "");
  const [nextWeekTargets, setNextWeekTargets] = useState(existingReport?.nextWeekTargets || "");

  // File upload states
  const [attachmentUrl, setAttachmentUrl] = useState(existingReport?.attachmentUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(
    existingReport?.attachmentUrl ? "Laporan_Mingguan_Terlampir.pdf" : null
  );

  // Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Hanya file PDF yang diperbolehkan.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadError("Ukuran file maksimal adalah 50MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setFileName(file.name);

    try {
      // Map weekLabel format "Agustus W1" to "Week 1 - Agustus" for Google Drive folder name
      const getDriveSubfolderName = (label: string) => {
        const parts = label.split(" ");
        if (parts.length === 2 && parts[1].startsWith("W")) {
          const month = parts[0];
          const weekNum = parts[1].replace("W", "");
          return `Week ${weekNum} - ${month}`;
        }
        return label;
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "weekly-reports");
      formData.append("subfolder", getDriveSubfolderName(weekLabel));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (response.ok && data.url) {
        setAttachmentUrl(data.url);
      } else {
        setUploadError(data.error || "Gagal mengunggah file.");
        setFileName(null);
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      setUploadError("Terjadi kesalahan saat mengunggah file.");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setAttachmentUrl("");
    setFileName(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!divisionId) {
      setErrorMsg("Pilih divisi terlebih dahulu.");
      return;
    }
    if (!achievements.trim() || !blockers.trim() || !nextWeekTargets.trim()) {
      setErrorMsg("Semua deskripsi wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("division_id", divisionId);
      formData.append("week_label", weekLabel);
      formData.append("achievements", achievements);
      formData.append("blockers", blockers);
      formData.append("next_week_targets", nextWeekTargets);
      formData.append("attachment_url", attachmentUrl);

      const res = await submitWeeklyReport(null, formData);
      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          existingReport 
            ? "Laporan berhasil diperbarui!" 
            : "Laporan berhasil disetor ke Pengawas!"
        );
        setTimeout(() => {
          router.push("/dashboard/weekly-report");
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="max-w-[768px] mx-auto flex flex-col gap-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/weekly-report"
          className="p-2 border border-outline-variant hover:bg-surface-container rounded-full transition-colors duration-200"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <span className="eyebrow text-accent-magenta">Weekly Report Module</span>
          <h1 className="headline-lg mt-1 font-bold tracking-tight">
            {existingReport ? "Ubah Laporan Mingguan" : "Setor Laporan Mingguan"}
          </h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-outline-variant/40 rounded-[32px] p-8 mt-4">
        {errorMsg && (
          <div className="p-4 bg-error-container/30 border border-error/20 text-error rounded-xl mb-6 text-sm flex items-start gap-2.5">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-block-mint text-emerald-950 border border-emerald-300 rounded-xl mb-6 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Division Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">Divisi</label>
              {session.roleLevel >= 75 ? (
                <select
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md text-sm bg-surface-bright focus:border-accent-magenta outline-none cursor-pointer"
                  disabled={!!existingReport} // Prevent changing division on edit
                >
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={session.divisionName}
                  disabled
                  className="w-full px-4 py-2 border border-outline-variant rounded-md text-sm bg-surface-container text-on-surface-variant font-medium outline-none cursor-not-allowed"
                />
              )}
            </div>

            {/* Week Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">Minggu Keberapa</label>
              <select
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-md text-sm bg-surface-bright focus:border-accent-magenta outline-none cursor-pointer"
                disabled={!!existingReport} // Prevent changing week on edit
              >
                {WEEKS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full h-px bg-outline-variant/30 my-4" />

          {/* Textareas */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                1. Apa saja yang berhasil diselesaikan minggu ini? (Achievements)
              </label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                rows={5}
                placeholder="Tuliskan capaian dan progres utama divisi Anda minggu ini..."
                className="w-full px-4 py-3 border border-outline-variant rounded-md text-sm bg-surface-bright focus:border-accent-magenta focus:border-2 outline-none resize-y leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-error mb-2">
                2. Apa kendala/masalah yang dihadapi? (Blockers)
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={4}
                placeholder="Tuliskan hambatan, masalah koordinasi, atau kendala lapangan..."
                className="w-full px-4 py-3 border border-outline-variant rounded-md text-sm bg-surface-bright focus:border-error focus:border-2 outline-none resize-y leading-relaxed text-error-container-on"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                3. Apa target utama minggu depan? (Next Week Targets)
              </label>
              <textarea
                value={nextWeekTargets}
                onChange={(e) => setNextWeekTargets(e.target.value)}
                rows={4}
                placeholder="Tuliskan rencana kerja, deadline terdekat, dan target utama divisi Anda untuk minggu depan..."
                className="w-full px-4 py-3 border border-outline-variant rounded-md text-sm bg-surface-bright focus:border-accent-magenta focus:border-2 outline-none resize-y leading-relaxed"
                required
              />
            </div>

            {/* PDF Attachment Upload */}
            <div className="pt-4 border-t border-outline-variant/30">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2">
                4. Lampiran Dokumen Laporan (Opsional - Format PDF)
              </label>
              
              {attachmentUrl ? (
                <div className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-on-surface">
                        {fileName || "Laporan_Mingguan.pdf"}
                      </p>
                      <a 
                        href={attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-accent-magenta hover:underline font-semibold"
                      >
                        Lihat Dokumen
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label className={`flex flex-col items-center justify-center w-full min-h-[140px] px-6 py-8 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-surface-bright/50 transition-colors duration-200 ${
                    uploadError ? "border-error/50 bg-error-container/5" : "border-outline-variant/60 bg-surface-bright"
                  }`}>
                    <div className="flex flex-col items-center justify-center text-center">
                      {isUploading ? (
                        <>
                          <Loader2 className="size-8 text-accent-magenta animate-spin mb-3" />
                          <p className="text-sm font-bold text-on-surface">Mengunggah file PDF...</p>
                          <p className="text-xs text-on-surface-variant mt-1">Harap tunggu sebentar</p>
                        </>
                      ) : (
                        <>
                          <Upload className="size-8 text-on-surface-variant mb-3 group-hover:text-accent-magenta transition-colors" />
                          <p className="text-sm font-bold text-on-surface">Klik untuk mengunggah atau seret file PDF di sini</p>
                          <p className="text-xs text-on-surface-variant mt-1.5">Format PDF saja (maksimal 50MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileUpload} 
                      disabled={isUploading}
                      className="hidden" 
                    />
                  </label>
                  
                  {uploadError && (
                    <p className="text-xs text-error font-medium mt-2 flex items-center gap-1.5 pl-1">
                      <AlertCircle className="size-3.5" />
                      {uploadError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-accent-magenta text-on-primary font-bold text-sm rounded-full transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Menyetorkan...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>{existingReport ? "Perbarui Laporan" : "Setor Laporan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
