import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

function chain(cfg: { data?: any; count?: number; error?: any } = {}) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'lte', 'not', 'or'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data: cfg.data ?? null, count: cfg.count ?? null, error: cfg.error ?? null });
  return c;
}

describe('Dashboard Data', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getDashboardOverview', () => {
    it('should return overview stats', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ count: 5 });
        if (t === 'kpi_items') return chain({ count: 10 });
        if (t === 'letter_requests') return chain({ count: 3 });
        if (t === 'meetings') return chain({ count: 7 });
        return chain();
      });
      const { getDashboardOverview } = await import('@/lib/data/dashboard');
      const stats = await getDashboardOverview('y-1');
      expect(stats.totalMembers).toBe(5);
      expect(stats.totalKpis).toBe(10);
      expect(stats.totalLetters).toBe(3);
      expect(stats.totalMeetings).toBe(7);
    });
  });

  describe('getDivisionsWithProgress', () => {
    it('should return division progress', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'divisions') return chain({ data: [{ id: 'd-1', name: 'Div A', slug: 'a', sort_order: 1 }] });
        if (t === 'kpi_items') return chain({ data: [{ id: 'k-1', is_milestone: true, division_id: 'd-1' }] });
        return chain();
      });
      const { getDivisionsWithProgress } = await import('@/lib/data/dashboard');
      const result = await getDivisionsWithProgress('y-1');
      expect(result).toHaveLength(1);
      expect(result[0].totalKpis).toBe(1);
      expect(result[0].milestones).toBe(1);
    });
  });
});
