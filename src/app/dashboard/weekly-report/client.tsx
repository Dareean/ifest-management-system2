"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WeeklyReport, ReportStatus } from "@/types/weekly-report";
import { reviewWeeklyReport } from "@/lib/actions/weekly-report";
import { 
  FileText, 
  Calendar, 
  Plus, 
  MessageSquare, 
  Check, 
  X, 
  AlertTriangle,
  ArrowRight,
  Eye,
  BarChart3,
  PieChart,
  Users,
  Info
} from "lucide-react";

interface WeeklyReportDashboardClientProps {
  session: any;
  isSupervisor: boolean;
  isBph: boolean;
  divisions: { id: string; name: string; slug: string; displayName?: string; supervisorName?: string | null }[];
  initialReports: WeeklyReport[];
  userDivision: { id: string; name: string } | null;
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

// Supervisor mapping group configuration
const SUPERVISOR_GROUPS = [
  { name: "Dareean A. Raffi Mardin", shortName: "Daren (Saya)", color: "bg-emerald-500", border: "border-emerald-250", text: "text-emerald-700", bgLight: "bg-emerald-50" },
  { name: "Gabriel Kristofan", shortName: "Gabriel", color: "bg-indigo-500", border: "border-indigo-250", text: "text-indigo-700", bgLight: "bg-indigo-50" },
  { name: "Reyqal Syawalano", shortName: "Reyqal", color: "bg-rose-500", border: "border-rose-250", text: "text-rose-700", bgLight: "bg-rose-50" }
];

export function WeeklyReportDashboardClient({
  session,
  isSupervisor,
  isBph,
  divisions,
  initialReports,
  userDivision
}: WeeklyReportDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDiv = searchParams?.get("div") || null;

  const [selectedWeek, setSelectedWeek] = useState<string>("Agustus W1");
  const [activeSupervisorFilter, setActiveSupervisorFilter] = useState<string>("all");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  
  // Synchronize division filter with URL query parameter
  useEffect(() => {
    if (urlDiv) {
      const matched = divisions.find(d => d.slug === urlDiv);
      if (matched) {
        setSelectedDivision(matched.id);
      } else {
        setSelectedDivision("all");
      }
    } else {
      setSelectedDivision("all");
    }
  }, [urlDiv, divisions]);

  // Modal states for Supervisor Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<WeeklyReport | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const userRoleLevel = session.roleLevel ?? 0;
  const isCoordinator = userRoleLevel >= 55; // level 55 is coordinator/wakil koordinator

  // --- STATS COMPUTATIONS (For selected week) ---
  const weekReports = initialReports.filter(r => r.weekLabel === selectedWeek);
  
  // Total divisions reporting (excluding BPH, which is done by filter in server fetch)
  const totalDivsCount = divisions.length;
  const approvedCount = weekReports.filter(r => r.status === "APPROVED").length;
  const pendingCount = weekReports.filter(r => r.status === "PENDING").length;
  const needFixCount = weekReports.filter(r => r.status === "NEED_FIX").length;
  const unsubmittedCount = Math.max(0, totalDivsCount - weekReports.length);
  
  const submissionRate = totalDivsCount > 0 ? Math.round((weekReports.length / totalDivsCount) * 100) : 0;

  // --- SUPERVISOR COMPLIANCE CALCULATION ---
  const supervisorCompliance = SUPERVISOR_GROUPS.map(group => {
    // Find divisions under this supervisor
    const groupDivs = divisions.filter(d => 
      d.supervisorName?.toLowerCase().includes(group.name.split(" ")[0].toLowerCase()) || 
      d.supervisorName?.toLowerCase().includes("dareean") && group.name.includes("Dareean")
    );
    
    const groupDivIds = groupDivs.map(gd => gd.id);
    
    // Reports of these divisions in this week
    const groupReports = weekReports.filter(r => 
      r.divisionId && groupDivIds.includes(r.divisionId) ||
      !r.divisionId && groupDivs.some(gd => gd.displayName === r.division || gd.name === r.division)
    );
    
    const approved = groupReports.filter(r => r.status === "APPROVED").length;
    const pending = groupReports.filter(r => r.status === "PENDING").length;
    const needFix = groupReports.filter(r => r.status === "NEED_FIX").length;
    const unsubmitted = Math.max(0, groupDivs.length - groupReports.length);
    
    return {
      ...group,
      total: groupDivs.length,
      approved,
      pending,
      needFix,
      unsubmitted,
      divisionsList: groupDivs.map(gd => {
        const rep = weekReports.find(r => r.divisionId === gd.id || r.division === gd.displayName || r.division === gd.name);
        return {
          name: gd.displayName || gd.name,
          status: rep ? rep.status : "UNSUBMITTED",
          report: rep || null
        };
      })
    };
  });

  // --- FILTERED DETAILED VIEW (For supervisor/BPH view grid) ---
  const filteredReports = initialReports.filter(report => {
    if (report.weekLabel !== selectedWeek) return false;
    
    if (selectedDivision !== "all") {
      if (report.divisionId && report.divisionId !== selectedDivision) return false;
      if (!report.divisionId) {
        const matchedDiv = divisions.find(d => d.slug === report.divisionSlug || d.name.toLowerCase() === report.division.toLowerCase());
        if (!matchedDiv || matchedDiv.id !== selectedDivision) return false;
      }
    }
    
    if (activeSupervisorFilter !== "all") {
      const matchName = activeSupervisorFilter === "daren" ? "dareean" : activeSupervisorFilter;
      if (!report.supervisorName?.toLowerCase().includes(matchName)) return false;
    }
    
    return true;
  });

  // Status Classes Helper
  const getStatusBadgeClass = (status: ReportStatus | "UNSUBMITTED") => {
    switch (status) {
      case "APPROVED":
        return "bg-block-mint text-emerald-900 border border-emerald-300";
      case "NEED_FIX":
        return "bg-block-pink text-error border border-error/20";
      case "PENDING":
        return "bg-block-coral text-amber-900 border border-amber-300";
      default:
        return "bg-surface-container-high text-on-surface-variant border border-outline-variant/30";
    }
  };

  const getStatusLabel = (status: ReportStatus | "UNSUBMITTED") => {
    switch (status) {
      case "APPROVED": return "DISETUJUI";
      case "NEED_FIX": return "BUTUH REVISI";
      case "PENDING": return "PENDING REVIEW";
      default: return "BELUM DISETOR";
    }
  };

  // Donut chart stroke calculations
  const radius = 55;
  const circ = 2 * Math.PI * radius; // ~345.57
  const approvedPct = totalDivsCount > 0 ? approvedCount / totalDivsCount : 0;
  const pendingPct = totalDivsCount > 0 ? pendingCount / totalDivsCount : 0;
  const needFixPct = totalDivsCount > 0 ? needFixCount / totalDivsCount : 0;
  const unsubmittedPct = totalDivsCount > 0 ? unsubmittedCount / totalDivsCount : 0;

  const appStroke = approvedPct * circ;
  const penStroke = pendingPct * circ;
  const fixStroke = needFixPct * circ;
  const unsStroke = unsubmittedPct * circ;

  const appOffset = 0;
  const penOffset = -appStroke;
  const fixOffset = -(appStroke + penStroke);
  const unsOffset = -(appStroke + penStroke + fixStroke);

  const handleOpenReviewModal = (report: WeeklyReport) => {
    setSelectedReportForReview(report);
    setSupervisorNotes(report.supervisorNotes || "");
    setReviewError(null);
    setIsModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReportForReview(null);
    setSupervisorNotes("");
    setReviewError(null);
  };

  const handleSubmitReview = (status: "APPROVED" | "NEED_FIX") => {
    if (!selectedReportForReview) return;
    
    setReviewError(null);
    startTransition(async () => {
      const res = await reviewWeeklyReport(selectedReportForReview.id, status, supervisorNotes);
      if (res && res.error) {
        setReviewError(res.error);
      } else {
        handleCloseReviewModal();
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="eyebrow text-accent-magenta">Weekly Report Management</span>
          <h1 className="headline-lg mt-1 font-bold tracking-tight">Sistem Pelaporan Mingguan</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitoring performa & kepatuhan pelaporan divisi panitia I-FEST 2026 secara transparan.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/40 rounded-full shadow-sm">
            <Calendar className="size-4 text-accent-magenta" />
            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setSelectedDivision("all");
              }}
              className="text-xs font-bold text-on-surface bg-transparent border-none outline-none cursor-pointer"
            >
              {WEEKS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Create Button only for coordinators (level >= 55) */}
          {isCoordinator && (
            <Link 
              href="/dashboard/weekly-report/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full hover:bg-accent-magenta font-semibold text-xs transition-all duration-250 shadow-sm"
            >
              <Plus className="size-3.5" />
              Setor Laporan
            </Link>
          )}
        </div>
      </div>

      {/* 2. Visual Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* KPI Cards & Overall Status Donut Chart */}
        <div className="bg-white border border-outline-variant/40 rounded-[32px] p-6 shadow-sm flex flex-col justify-between group hover:border-outline-variant/80 transition-all duration-300">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow text-xs text-on-surface-variant font-mono">STATUS KEPATUHAN</span>
              <PieChart className="size-4 text-accent-magenta" />
            </div>
            <h3 className="text-base font-extrabold text-on-surface tracking-tight">Kepatuhan Seluruh Divisi</h3>
            <p className="text-xs text-on-surface-variant">Kalkulasi kepatuhan setor untuk {selectedWeek}</p>
          </div>

          {/* Donut Chart SVG */}
          <div className="flex items-center justify-center py-4 relative">
            <svg width="150" height="150" className="transform -rotate-90">
              {/* Empty background circle */}
              <circle cx="75" cy="75" r={radius} fill="transparent" stroke="#f1ecef" strokeWidth="12" />
              
              {/* Approved segment */}
              {appStroke > 0 && (
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${appStroke} ${circ}`}
                  strokeDashoffset={appOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}

              {/* Pending segment */}
              {penStroke > 0 && (
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${penStroke} ${circ}`}
                  strokeDashoffset={penOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}

              {/* Need Fix segment */}
              {fixStroke > 0 && (
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="12"
                  strokeDasharray={`${fixStroke} ${circ}`}
                  strokeDashoffset={fixOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}

              {/* Unsubmitted segment */}
              {unsStroke > 0 && (
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  strokeDasharray={`${unsStroke} ${circ}`}
                  strokeDashoffset={unsOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              )}
            </svg>
            
            {/* Center percentage content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-on-surface tracking-tighter leading-none">{submissionRate}%</span>
              <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase mt-0.5">Disetor</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-outline-variant/30 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Disetujui ({approvedCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Pending ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="size-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Revisi ({needFixCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="size-2.5 rounded-full bg-slate-300 shrink-0" />
              <span>Belum ({unsubmittedCount})</span>
            </div>
          </div>
        </div>

        {/* Supervisor Stacked Bar Chart Card */}
        <div className="bg-white border border-outline-variant/40 rounded-[32px] p-6 shadow-sm flex flex-col justify-between xl:col-span-2 group hover:border-outline-variant/80 transition-all duration-300">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="eyebrow text-xs text-on-surface-variant font-mono">SUPERVISOR PROGRESS</span>
              <BarChart3 className="size-4 text-accent-magenta" />
            </div>
            <h3 className="text-base font-extrabold text-on-surface tracking-tight">Kepatuhan per Pengawas</h3>
            <p className="text-xs text-on-surface-variant">Statistik laporan dari divisi di bawah Daren, Gabriel, dan Reyqal</p>
          </div>

          {/* Custom Interactive Segmented Progress Bars */}
          <div className="flex flex-col gap-6 py-2">
            {supervisorCompliance.map(sup => {
              // Calculate percent widths
              const appWidth = (sup.approved / sup.total) * 100;
              const penWidth = (sup.pending / sup.total) * 100;
              const fixWidth = (sup.needFix / sup.total) * 100;
              const unsWidth = (sup.unsubmitted / sup.total) * 100;

              return (
                <div key={sup.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${sup.bgLight} ${sup.text}`}>
                        {sup.shortName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase">
                      {sup.approved} / {sup.total} DISETUJUI
                    </span>
                  </div>

                  {/* The compliance bar */}
                  <div className="h-6 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner relative group/bar">
                    {/* Approved segment */}
                    {appWidth > 0 && (
                      <div 
                        style={{ width: `${appWidth}%` }} 
                        className="h-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 cursor-help"
                        title={`${sup.approved} Divisi Disetujui`}
                      />
                    )}
                    {/* Pending segment */}
                    {penWidth > 0 && (
                      <div 
                        style={{ width: `${penWidth}%` }} 
                        className="h-full bg-amber-400 hover:bg-amber-500 transition-all duration-200 cursor-help"
                        title={`${sup.pending} Divisi Pending Review`}
                      />
                    )}
                    {/* Need Fix segment */}
                    {fixWidth > 0 && (
                      <div 
                        style={{ width: `${fixWidth}%` }} 
                        className="h-full bg-rose-500 hover:bg-rose-600 transition-all duration-200 cursor-help"
                        title={`${sup.needFix} Divisi Butuh Revisi`}
                      />
                    )}
                    {/* Unsubmitted segment */}
                    {unsWidth > 0 && (
                      <div 
                        style={{ width: `${unsWidth}%` }} 
                        className="h-full bg-slate-200 hover:bg-slate-300 transition-all duration-200 cursor-help"
                        title={`${sup.unsubmitted} Divisi Belum Menyetor`}
                      />
                    )}
                  </div>

                  {/* Divisions & Status Subtext (Hover Interactive Details) */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-on-surface-variant">
                    {sup.divisionsList.map(div => {
                      let dotColor = "bg-slate-300";
                      if (div.status === "APPROVED") dotColor = "bg-emerald-500";
                      else if (div.status === "PENDING") dotColor = "bg-amber-400";
                      else if (div.status === "NEED_FIX") dotColor = "bg-rose-500";

                      return (
                        <div key={div.name} className="flex items-center gap-1">
                          <span className={`size-1.5 rounded-full ${dotColor}`} />
                          <span className="font-semibold">{div.name}</span>
                          <span className="text-[8px] font-mono uppercase bg-surface-container px-1 rounded-sm text-slate-500">
                            {div.status === "UNSUBMITTED" ? "BELUM" : div.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Detailed Data View with Transparency */}
      
      {/* Case A: Supervisor / BPH Dashboard View */}
      {(isSupervisor || isBph) ? (
        <div className="flex flex-col gap-6">
          <div className="border-b border-outline-variant/30 pb-4">
            <h2 className="headline-sm-mobile font-bold tracking-tight text-on-surface">Detail Laporan Seluruh Divisi</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Filter dan evaluasi laporan mingguan sesuai wewenang.</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 p-5 bg-white border border-outline-variant/40 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-on-surface-variant shrink-0" />
              <span className="text-xs font-bold text-on-surface">Filter Pengawas:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 bg-surface-container-low p-1 rounded-full border border-outline-variant/30">
              <button
                onClick={() => {
                  setActiveSupervisorFilter("all");
                  setSelectedDivision("all");
                }}
                className={`cursor-pointer rounded-full px-4 py-1 text-xs font-semibold transition-all duration-200 ${
                  activeSupervisorFilter === "all" ? "bg-white text-on-surface shadow-sm font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  setActiveSupervisorFilter("daren");
                  setSelectedDivision("all");
                }}
                className={`cursor-pointer rounded-full px-4 py-1 text-xs font-semibold transition-all duration-200 ${
                  activeSupervisorFilter === "daren" ? "bg-white text-on-surface shadow-sm font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Daren
              </button>
              <button
                onClick={() => {
                  setActiveSupervisorFilter("gabriel");
                  setSelectedDivision("all");
                }}
                className={`cursor-pointer rounded-full px-4 py-1 text-xs font-semibold transition-all duration-200 ${
                  activeSupervisorFilter === "gabriel" ? "bg-white text-on-surface shadow-sm font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Gabriel
              </button>
              <button
                onClick={() => {
                  setActiveSupervisorFilter("reyqal");
                  setSelectedDivision("all");
                }}
                className={`cursor-pointer rounded-full px-4 py-1 text-xs font-semibold transition-all duration-200 ${
                  activeSupervisorFilter === "reyqal" ? "bg-white text-on-surface shadow-sm font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Reyqal
              </button>
            </div>

            <div className="w-px h-6 bg-outline-variant/40 hidden md:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">Divisi:</span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="px-3 py-1.5 border border-outline-variant rounded-md text-xs bg-surface-bright focus:border-accent-magenta outline-none cursor-pointer font-semibold"
              >
                <option value="all">Semua Divisi</option>
                {divisions
                  .filter(d => {
                    if (activeSupervisorFilter === "all") return true;
                    const matchName = activeSupervisorFilter === "daren" ? "dareean" : activeSupervisorFilter;
                    return d.supervisorName?.toLowerCase().includes(matchName);
                  })
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.displayName || d.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Division Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {divisions
              .filter(div => {
                // Supervisor filter
                if (activeSupervisorFilter !== "all") {
                  const matchName = activeSupervisorFilter === "daren" ? "dareean" : activeSupervisorFilter;
                  if (!div.supervisorName?.toLowerCase().includes(matchName)) return false;
                }
                
                // Division filter
                if (selectedDivision !== "all" && div.id !== selectedDivision) return false;
                
                return true;
              })
              .map(div => {
                const divName = div.displayName || div.name;
                const report = weekReports.find(r => r.divisionId === div.id || r.division === divName || r.division.toLowerCase() === div.name.toLowerCase());
                
                // Check if user has supervisor role for this division or is BPH
                const isSupervisedByMe = isBph || div.supervisorName?.toLowerCase().includes(session.fullName.split(" ")[0].toLowerCase()) || (session.fullName.toLowerCase().includes("dareean") && div.supervisorName?.toLowerCase().includes("dareean"));

                return (
                  <div 
                    key={div.id}
                    className="bg-white border border-outline-variant/40 rounded-[32px] p-6 flex flex-col justify-between hover:border-outline-variant/80 shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div>
                          <span className="eyebrow text-xs text-on-surface-variant font-mono">DIVISI</span>
                          <h3 className="text-lg font-extrabold text-on-surface tracking-tight group-hover:text-accent-magenta transition-colors">{divName}</h3>
                          <span className="text-[10px] font-mono text-slate-400">Pengawas: {div.supervisorName || "BPH"}</span>
                        </div>
                        {report ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold select-none ${getStatusBadgeClass(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-container-high text-on-surface-variant select-none">
                            BELUM DISETOR
                          </span>
                        )}
                      </div>

                      {report ? (
                        <div className="space-y-4 text-sm mt-4">
                          <div>
                            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">Capaian Minggu Ini:</h4>
                            <p className="text-on-surface-variant mt-1 line-clamp-3 leading-relaxed whitespace-pre-line">{report.achievements}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider text-error">Kendala (Blockers):</h4>
                            <p className="text-on-surface-variant mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">{report.blockers}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">Target Minggu Depan:</h4>
                            <p className="text-on-surface-variant mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">{report.nextWeekTargets}</p>
                          </div>
                          {report.attachmentUrl && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/20">
                              <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Lampiran:</span>
                              <a
                                href={report.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                <FileText className="size-3.5" />
                                <span>Unduh PDF</span>
                              </a>
                            </div>
                          )}
                          {report.supervisorNotes && (
                            <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl mt-2">
                              <span className="font-bold text-[10px] text-accent-magenta uppercase tracking-wider">Catatan Pengawas:</span>
                              <p className="text-xs text-on-surface-variant mt-1 italic">{report.supervisorNotes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center text-on-surface-variant/40 mt-4 select-none">
                          <FileText className="size-12 stroke-[1.5] mb-2 text-on-surface-variant/20" />
                          <p className="text-sm font-medium">Belum ada laporan disetor</p>
                          <p className="text-xs">Untuk minggu {selectedWeek}</p>
                        </div>
                      )}
                    </div>

                    {report && (
                      <div className="border-t border-outline-variant/40 pt-4 mt-6">
                        {isSupervisedByMe ? (
                          <button
                            onClick={() => handleOpenReviewModal(report)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-semibold text-xs rounded-full transition-all duration-200 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            Tinjau & Ubah Status
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReportForReview(report);
                              setIsModalOpen(true);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-full transition-all duration-200 cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                            Lihat Detail Laporan
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        
        // Case B: Coordinator / Division Member View (Transparency Mode)
        <div className="flex flex-col gap-6">
          <div className="border-b border-outline-variant/30 pb-4 flex justify-between items-end">
            <div>
              <h2 className="headline-sm-mobile font-bold tracking-tight text-on-surface">Riwayat Laporan - Divisi {userDivision?.name}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Daftar pelaporan divisi Anda yang dapat diakses oleh seluruh anggota.</p>
            </div>
            
            {/* Show badge if regular member (Lvl < 55) showing they are viewing read-only transparency mode */}
            {!isCoordinator && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high border border-outline-variant/35 rounded-full text-[10px] font-mono font-bold text-slate-500 select-none">
                <Info className="size-3 text-slate-500" />
                TRANSPARANSI VIEW (READ-ONLY)
              </span>
            )}
          </div>

          <div className="bg-white border border-outline-variant/40 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant/40 bg-surface-container-low/50">
              <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">Setoran Progres Divisi</h3>
            </div>
            
            {initialReports.filter(r => r.divisionId === userDivision?.id || r.division.toLowerCase() === userDivision?.name.toLowerCase()).length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant/40 flex flex-col items-center justify-center">
                <FileText className="size-16 stroke-[1] mb-3 text-on-surface-variant/20" />
                <p className="font-bold text-lg text-on-surface-variant">Belum ada laporan disetor</p>
                <p className="text-sm mt-1">Mulai setor laporan progres pertama Anda minggu ini.</p>
                {isCoordinator && (
                  <Link 
                    href="/dashboard/weekly-report/create" 
                    className="mt-4 text-sm font-bold text-accent-magenta hover:underline inline-flex items-center gap-1"
                  >
                    Setor sekarang <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {initialReports
                  .filter(r => r.divisionId === userDivision?.id || r.division.toLowerCase() === userDivision?.name.toLowerCase())
                  .map((report) => (
                    <div key={report.id} className="p-6 hover:bg-surface-container-low/30 transition-all duration-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-extrabold text-on-surface">{report.weekLabel}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide select-none ${getStatusBadgeClass(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-on-surface-variant">
                          Disetor pada: {new Date(report.submittedAt).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                          <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider mb-1">Capaian Minggu Ini:</h5>
                          <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{report.achievements}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-error uppercase tracking-wider mb-1">Kendala (Blockers):</h5>
                          <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{report.blockers}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider mb-1">Target Minggu Depan:</h5>
                          <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{report.nextWeekTargets}</p>
                        </div>
                      </div>

                      {report.attachmentUrl && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/20">
                          <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Lampiran:</span>
                          <a
                            href={report.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="size-3.5" />
                            <span>Lihat PDF</span>
                          </a>
                        </div>
                      )}

                      {/* Supervisor Notes display */}
                      {report.supervisorNotes && (
                        <div className="mt-4 p-4 bg-surface-container border border-outline-variant/30 rounded-2xl flex gap-3 items-start">
                          <MessageSquare className="size-5 text-accent-magenta shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-xs text-accent-magenta uppercase tracking-wider">Catatan Balik Pengawas:</span>
                            <p className="text-sm text-on-surface-variant mt-1 italic whitespace-pre-line leading-relaxed">
                              {report.supervisorNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Edit Button: Visible ONLY for coordinators (Lvl >= 55) and if report is not approved */}
                      {isCoordinator && report.status !== "APPROVED" && (
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/20">
                          <Link
                            href={`/dashboard/weekly-report/create?edit=${report.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline hover:bg-surface-container text-on-surface font-semibold text-xs rounded-full transition-all duration-200"
                          >
                            Ubah Laporan
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Supervisor Review / Detail Modal */}
      {isModalOpen && selectedReportForReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-outline-variant/60 rounded-[32px] w-full max-w-lg p-8 shadow-xl max-h-[90vh] overflow-y-auto flex flex-col justify-between animate-scale-up">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="eyebrow text-accent-magenta">Detail Laporan Mingguan</span>
                  <h2 className="headline-lg-mobile font-bold tracking-tight mt-1">{selectedReportForReview.division}</h2>
                  <p className="text-xs font-mono text-on-surface-variant mt-0.5">Minggu: {selectedReportForReview.weekLabel}</p>
                </div>
                <button 
                  onClick={handleCloseReviewModal}
                  className="p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <X className="size-6 text-on-surface-variant" />
                </button>
              </div>

              {reviewError && (
                <div className="p-4 bg-error-container/30 border border-error/20 text-error rounded-xl mb-4 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-bold text-xs uppercase text-on-surface">Achievements</h4>
                  <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-line leading-relaxed">{selectedReportForReview.achievements}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-error">Blockers</h4>
                  <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-line leading-relaxed">{selectedReportForReview.blockers}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-on-surface">Next Week Targets</h4>
                  <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-line leading-relaxed">{selectedReportForReview.nextWeekTargets}</p>
                </div>

                {selectedReportForReview.attachmentUrl && (
                  <div className="border-t border-outline-variant/40 pt-4">
                    <h4 className="font-bold text-xs uppercase text-on-surface mb-2">Lampiran Laporan Mingguan:</h4>
                    <a
                      href={selectedReportForReview.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <FileText className="size-4" />
                      <span>Buka Laporan PDF</span>
                    </a>
                  </div>
                )}

                {/* Supervisor Notes section - display input only if user is supervisor/BPH, and if they have permission to write */}
                {(isSupervisor || isBph) && (
                  <div className="border-t border-outline-variant/40 pt-4">
                    {/* Check if this division is supervised by this user or user is BPH */}
                    {isBph || selectedReportForReview.supervisorId === session.assignmentId || 
                     (selectedReportForReview.supervisorName && selectedReportForReview.supervisorName.toLowerCase().includes(session.fullName.split(" ")[0].toLowerCase())) ||
                     (selectedReportForReview.supervisorName && session.fullName.toLowerCase().includes("dareean") && selectedReportForReview.supervisorName.toLowerCase().includes("dareean")) ? (
                      <>
                        <label className="block text-xs font-bold uppercase text-on-surface mb-2">Catatan Pengawas (Notes):</label>
                        <textarea
                          value={supervisorNotes}
                          onChange={(e) => setSupervisorNotes(e.target.value)}
                          rows={3}
                          placeholder="Masukkan saran, apresiasi, atau petunjuk revisi di sini..."
                          className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface-bright focus:border-accent-magenta outline-none resize-y"
                        />
                      </>
                    ) : (
                      selectedReportForReview.supervisorNotes && (
                        <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl">
                          <span className="font-bold text-[10px] text-accent-magenta uppercase tracking-wider">Catatan Pengawas ({selectedReportForReview.supervisorName}):</span>
                          <p className="text-xs text-on-surface-variant mt-1 italic">{selectedReportForReview.supervisorNotes}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Show button actions only if the user has supervisor/BPH authority over this specific division */}
            {(isBph || selectedReportForReview.supervisorId === session.assignmentId || 
              (selectedReportForReview.supervisorName && selectedReportForReview.supervisorName.toLowerCase().includes(session.fullName.split(" ")[0].toLowerCase())) ||
              (selectedReportForReview.supervisorName && session.fullName.toLowerCase().includes("dareean") && selectedReportForReview.supervisorName.toLowerCase().includes("dareean"))) ? (
              <div className="flex flex-col sm:flex-row gap-3 border-t border-outline-variant/40 pt-6">
                <button
                  onClick={() => handleSubmitReview("NEED_FIX")}
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-error hover:bg-block-pink text-error font-bold text-sm rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <X className="size-4" />
                  Butuh Revisi
                </button>
                <button
                  onClick={() => handleSubmitReview("APPROVED")}
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-accent-magenta text-on-primary font-bold text-sm rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-4" />
                  Setujui Laporan
                </button>
              </div>
            ) : (
              <div className="flex justify-end border-t border-outline-variant/40 pt-6">
                <button
                  onClick={handleCloseReviewModal}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-on-surface font-bold text-xs rounded-full transition-all duration-200 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
