export type DivisionName = string;

export type ReportStatus = 'PENDING' | 'APPROVED' | 'NEED_FIX';

export interface WeeklyReport {
  id: string;
  division: string;
  divisionId?: string;
  divisionSlug?: string;
  supervisorName?: string;
  supervisorId?: string;
  weekLabel: string; // e.g., "Agustus W1", "Agustus W2"
  submittedAt: string; // ISO date string
  achievements: string; // capaian minggu ini
  blockers: string; // kendala di lapangan
  nextWeekTargets: string; // target minggu depan
  status: ReportStatus;
  supervisorNotes?: string; // catatan balik dari Pengawas
  attachmentUrl?: string; // Link to PDF report
}
