import { Activity } from "lucide-react";

interface VerificationData {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

const DEFAULT_DATA: VerificationData = {
  total: 9,
  verified: 1,
  pending: 7,
  rejected: 1,
};

export function VerificationDonutChart({ data = DEFAULT_DATA }: { data?: VerificationData }) {
  const { total, verified, pending, rejected } = data;

  const verifiedPercent = total > 0 ? Math.round((verified / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectedPercent = total > 0 ? Math.max(0, 100 - verifiedPercent - pendingPercent) : 0;

  // Donut SVG calculations
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  // Offsets for circle dasharray
  const strokeDasharrayVerified = `${(verifiedPercent / 100) * circumference} ${circumference}`;
  const strokeDasharrayPending = `${(pendingPercent / 100) * circumference} ${circumference}`;
  const strokeDasharrayRejected = `${(rejectedPercent / 100) * circumference} ${circumference}`;

  const offsetVerified = 0;
  const offsetPending = -((verifiedPercent / 100) * circumference);
  const offsetRejected = -(((verifiedPercent + pendingPercent) / 100) * circumference);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xs flex flex-col justify-between h-full gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-pink-500" />
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
            Status Verifikasi
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Proporsi pembagian verifikasi pendaftaran
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

          {/* Verified segment (Green) */}
          {verifiedPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayVerified}
              strokeDashoffset={offsetVerified}
              className="transition-all duration-700"
            />
          )}

          {/* Pending segment (Orange/Yellow) */}
          {pendingPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayPending}
              strokeDashoffset={offsetPending}
              className="transition-all duration-700"
            />
          )}

          {/* Rejected segment (Pink) */}
          {rejectedPercent > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="18"
              strokeDasharray={strokeDasharrayRejected}
              strokeDashoffset={offsetRejected}
              className="transition-all duration-700"
            />
          )}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            PENDAFTAR
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none mt-1 font-sans">
            {total}
          </span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex flex-col gap-3 pt-2 text-xs font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Terverifikasi</span>
          </div>
          <span className="font-mono text-slate-900 font-bold">
            {verified} <span className="text-slate-400 font-normal">({verifiedPercent}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Pending</span>
          </div>
          <span className="font-mono text-slate-900 font-bold">
            {pending} <span className="text-slate-400 font-normal">({pendingPercent}%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span className="text-slate-600 font-medium">Ditolak</span>
          </div>
          <span className="font-mono text-slate-900 font-bold">
            {rejected} <span className="text-slate-400 font-normal">({rejectedPercent}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
