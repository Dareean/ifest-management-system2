import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

function chain(data: any = null) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'lte', 'not'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

function kpiChain() {
  return chain([{ id: 'kpi-1', title: 'KPI 1', target: '100%', deadline: '2026-12-31', is_milestone: false }]);
}

function taskChain() {
  return chain([{ id: 't-1', title: 'Task 1', status: 'done', priority: 'high', deadline: '2026-12-01', kpi_item_id: 'kpi-1' }]);
}

describe('Personal Dashboard Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('getCurrentUserId', () => {
    it('should return user id', async () => {
      const { getCurrentUserId } = await import('@/lib/data/personal-dashboard');
      const result = await getCurrentUserId();
      expect(result).toBe('user-1');
    });

    it('should return null when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { getCurrentUserId } = await import('@/lib/data/personal-dashboard');
      const result = await getCurrentUserId();
      expect(result).toBeNull();
    });
  });

  describe('getCurrentAssignment', () => {
    it('should return assignment for user', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { name: 'Anggota', slug: 'anggota', level: 50 }, division: { id: 'd-1', name: 'Div A' } });
        return chain(null);
      });
      const { getCurrentAssignment } = await import('@/lib/data/personal-dashboard');
      const result = await getCurrentAssignment('user-1');
      expect(result!.divisionName).toBe('Div A');
    });

    it('should return null when no assignment', async () => {
      const { getCurrentAssignment } = await import('@/lib/data/personal-dashboard');
      const result = await getCurrentAssignment('user-1');
      expect(result).toBeNull();
    });
  });

  describe('getUserTasks', () => {
    it('should return tasks with kpi info', async () => {
      let committeeCalls = 0;
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') {
          committeeCalls++;
          return committeeCalls === 1 ? chain({ id: 'a-1', division_id: 'd-1' }) : chain(null);
        }
        if (t === 'kpi_items') return kpiChain();
        if (t === 'tasks') return taskChain();
        return chain(null);
      });
      const { getUserTasks } = await import('@/lib/data/personal-dashboard');
      const result = await getUserTasks('a-1');
      expect(result.length).toBe(1);
      expect(result[0].kpi).toBe('KPI 1');
    });

    it('should return empty when no assignment found', async () => {
      const { getUserTasks } = await import('@/lib/data/personal-dashboard');
      const result = await getUserTasks('invalid-id');
      expect(result).toEqual([]);
    });

    it('should return empty when no kpis found', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1' });
        return chain(null);
      });
      const { getUserTasks } = await import('@/lib/data/personal-dashboard');
      const result = await getUserTasks('a-1');
      expect(result).toEqual([]);
    });
  });

  describe('getPersonalDashboard', () => {
    it('should return personal dashboard data with full info', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division: { id: 'd-1', name: 'Div A' }, division_id: 'd-1', role: { name: 'Anggota', slug: 'anggota', level: 50 } });
        if (t === 'kpi_items') return kpiChain();
        if (t === 'tasks') return taskChain();
        if (t === 'letter_requests') return chain([{ id: 'l-1', subject: 'Surat', status: 'requested', created_at: '2026-07-01' }]);
        if (t === 'meeting_invitees') return chain([]);
        return chain(null);
      });
      const { getPersonalDashboard } = await import('@/lib/data/personal-dashboard');
      const result = await getPersonalDashboard();
      expect(result).toBeDefined();
      expect(result.assignment).toBeDefined();
      expect(result.kpis.length).toBe(1);
      expect(result.tasks.length).toBe(1);
      expect(result.letters.length).toBe(1);
    });

    it('should return empty data when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { getPersonalDashboard } = await import('@/lib/data/personal-dashboard');
      const result = await getPersonalDashboard();
      expect(result.userId).toBeNull();
      expect(result.assignment).toBeNull();
    });

    it('should return partial data when no assignment', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain(null);
        return chain(null);
      });
      const { getPersonalDashboard } = await import('@/lib/data/personal-dashboard');
      const result = await getPersonalDashboard();
      expect(result.userId).toBe('user-1');
      expect(result.assignment).toBeNull();
    });
  });

  describe('getLetterStats', () => {
    it('should return letter stats', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') return chain([{ status: 'requested' }, { status: 'approved' }, { status: 'sent' }]);
        return chain(null);
      });
      const { getLetterStats } = await import('@/lib/data/personal-dashboard');
      const result = await getLetterStats();
      expect(result.pending).toBe(1);
      expect(result.approved).toBe(1);
      expect(result.sent).toBe(1);
    });
  });

  describe('getAllLetters', () => {
    it('should return all letters', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') return chain([{
          id: 'l-1', letter_type: 'permohonan', subject: 'Test', status: 'requested',
          priority: 'tinggi', created_at: '2026-07-01',
          division: { name: 'Div A' },
          requester: { user: { full_name: 'User 1' } },
        }]);
        return chain(null);
      });
      const { getAllLetters } = await import('@/lib/data/personal-dashboard');
      const result = await getAllLetters(5);
      expect(result.length).toBe(1);
      expect(result[0].division).toBe('Div A');
    });

    it('should return empty array when no data', async () => {
      const { getAllLetters } = await import('@/lib/data/personal-dashboard');
      const result = await getAllLetters(5);
      expect(result).toEqual([]);
    });
  });
});
