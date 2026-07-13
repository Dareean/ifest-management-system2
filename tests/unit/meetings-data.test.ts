import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'lte', 'not', 'or'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('Meetings Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getMeetings', () => {
    it('should return all meetings', async () => {
      const meetings = [{ id: 'm-1', title: 'Meeting 1', status: 'akan_datang', meeting_type: 'scheduled', scope: 'all', started_at: '2026-07-15T10:00:00Z', creator: { user: { full_name: 'Creator' } }, division: null }];
      mockFrom.mockImplementation((t: string) => {
        if (t === 'meetings') return createMockSupabase(meetings);
        return createMockSupabase(null);
      });
      const { getMeetings } = await import('@/lib/data/meetings');
      const result = await getMeetings();
      expect(result).toHaveLength(1);
    });

    it('should return empty on error', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'meetings') {
          const chain: any = {};
          ['select', 'eq', 'order', 'or', 'in', 'gte', 'lte'].forEach(m => { chain[m] = vi.fn(() => chain); });
          chain.then = (resolve: any) => resolve({ data: null, error: new Error('fail') });
          return chain;
        }
        return createMockSupabase(null);
      });
      const { getMeetings } = await import('@/lib/data/meetings');
      expect(await getMeetings()).toEqual([]);
    });
  });
});
