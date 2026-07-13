import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) } }),
}));

describe('Export Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('exportKpiCSV', () => {
    it('should return empty string when not authorized', async () => {
      mockFrom.mockReturnValue(createMockSupabase(null));
      const { exportKpiCSV } = await import('@/lib/actions/export');
      expect(await exportKpiCSV()).toBe('');
    });

    it('should export KPI CSV with data', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'divisions') return createMockSupabase([{ id: 'd-1', name: 'Divisi A', slug: 'a' }]);
        if (t === 'kpi_items') return createMockSupabase([{ id: 'k-1', title: 'KPI 1', target: '100%', deadline: '2026-12-31', is_milestone: true }]);
        if (t === 'tasks') return createMockSupabase([{ title: 'T1', status: 'done' }, { title: 'T2', status: 'todo' }]);
        return createMockSupabase(null);
      });
      const { exportKpiCSV } = await import('@/lib/actions/export');
      const csv = await exportKpiCSV();
      expect(csv).toContain('Divisi A');
      expect(csv).toContain('KPI 1');
      expect(csv).toContain('50%');
    });
  });

  describe('exportLettersCSV', () => {
    it('should export letters CSV', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'letter_requests') return createMockSupabase([{
          letter_type: 'Surat Permohonan', subject: 'Test', status: 'sent', priority: 'tinggi',
          category: 'eksternal', deadline_at: '2026-12-31', target_institution: 'UNIV',
          revision_count: 0, division: { name: 'Divisi A' },
          requester: { user: { full_name: 'Test User' } },
          created_at: '2026-07-01T00:00:00Z',
        }]);
        return createMockSupabase(null);
      });
      const { exportLettersCSV } = await import('@/lib/actions/export');
      const csv = await exportLettersCSV();
      expect(csv).toContain('Test');
    });
  });

  describe('exportMeetingsCSV', () => {
    it('should export meetings CSV', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'meetings') return createMockSupabase([{
          id: 'm-1', title: 'Meeting 1', agenda: 'Agenda', meeting_type: 'scheduled',
          meeting_link: 'https://meet.google.com', location: 'Room A',
          started_at: '2026-07-15T10:00:00Z', ended_at: null,
          scope: 'all', creator: { user: { full_name: 'Creator' } },
        }]);
        if (t === 'meeting_notes') return createMockSupabase(null);
        return createMockSupabase(null);
      });
      const { exportMeetingsCSV } = await import('@/lib/actions/export');
      const csv = await exportMeetingsCSV();
      expect(csv).toContain('Meeting 1');
    });
  });

  describe('exportPersonnelCSV', () => {
    it('should export personnel CSV', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase([{
          user: { full_name: 'Test User', nim: '123' },
          division: { name: 'Divisi A' },
          role: { name: 'Anggota', level: 50 },
        }]);
        return createMockSupabase(null);
      });
      const { exportPersonnelCSV } = await import('@/lib/actions/export');
      const csv = await exportPersonnelCSV();
      expect(csv).toContain('Test User');
    });
  });
});
