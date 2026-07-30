import { Calendar, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

const YEAR_ID = "c2f2a48e-3e58-4559-aaa0-623a3825348b";

interface AttendanceData {
  total: number;
  attending: number;
  permission: number;
  absent: number;
}

export async function VerificationDonutChart({ data }: { data?: AttendanceData }) {
  let statsData = data;

  if (!statsData) {
    const supabase = createAdminClient();
    const { data: invitees } = await supabase
      .from("meeting_invitees")
      .select("rsvp_status");

    const all = invitees ?? [];
    const attending = all.filter((i: any) => i.rsvp_status === "attending" || i.rsvp_status === "present").length;
    const permission = all.filter((i: any) => i.rsvp_status === "permission" || i.rsvp_status === "excused").length;
    const absent = all.filter((i: any) => i.rsvp_status === "absent" || i.rsvp_status === "none" || !i.rsvp_status).length;
    const total = all.length || 1;

    statsData = {
      total,
      attending,
      permission,
      absent,
    };
  }

  const { total, attending, permission, absent } = statsData;

  const attendingPercent = total > 0 ? Math.round((attending / total) * 100) : 0;
  const permissionPercent = total > 0 ? Math.round((permission / total) * 100) : 0;
  const absentPercent = total > 0 ? Math.max(0, 100 - attendingPercent - permissionPercent) : 0;

  // Donut SVG calculations
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  // Offsets for circle dasharray
  const strokeDasharrayAttending = `${(attendingPercent / 100) * circumference} ${circumference}`;
  const strokeDasharrayPermission = `${(permissionPercent / 100) * circumference} ${circumference}`;
  const strokeDasharrayAbsent = `${(absentPercent / 100) * circumference} ${circumference}`;

  const offsetAttending = 0;
  const offsetPermission = -((attendingPercent / 100) * circumference);
  const offsetAbsent = -(((attendingPercent + permissionPercent) / 100) * circumference);

  return (
    <div className="bg-white border border-[#04000D]/5 rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-full gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-accent-magenta" />
          <h3 className="text-lg font-extrabold text-on-surface tracking-tight font-sans">
            Partisipasi Rapat
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant font-sans mt-1">
          Tingkat presensi dan partisipasi panitia dalam rapat
        </p>
      </div>

      {/* SVG Donut Chart with Center Text */}
      <div className="flex items-center justify-center my-2 relative">
        <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="18"
          />

          {/* Attending segment (Green) */}
          {attendingPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayAttending}
              strokeDashoffset={offsetAttending}
              className="transition-all duration-700"
            />
          )}

          {/* Permission segment (Amber Yellow) */}
          {permissionPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayPermission}
              strokeDashoffset={offsetPermission}
              className="transition-all duration-700"
            />
          )}

          {/* Absent segment (Rose Pink) */}
          {absentPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#ff3d8b"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayAbsent}
              strokeDashoffset={offsetAbsent}
              className="transition-all duration-700"
            />
          )}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-on-surface leading-none font-sans">
            {attendingPercent}%
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-on-surface-variant/70 uppercase mt-1">
            PRESENSI HADIR
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex flex-col gap-3 pt-2 text-xs font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-on-surface-variant font-medium">Hadir Rapat</span>
          </div>
          <span className="font-mono text-on-surface font-bold">
            {attending} <span className="text-on-surface-variant/70 font-normal">({attendingPercent}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-on-surface-variant font-medium">Izin / Sakit</span>
          </div>
          <span className="font-mono text-on-surface font-bold">
            {permission} <span className="text-on-surface-variant/70 font-normal">({permissionPercent}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3D8B]" />
            <span className="text-on-surface-variant font-medium">Tanpa Keterangan</span>
          </div>
          <span className="font-mono text-on-surface font-bold">
            {absent} <span className="text-on-surface-variant/70 font-normal">({absentPercent}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
