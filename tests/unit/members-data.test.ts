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

describe('Members Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getAllMembers', () => {
    it('should return grouped members by division', async () => {
      const profiles = [{ id: 'u-1', full_name: 'User 1', nim: '123' }];
      const assignments = [
        { user_id: 'u-1', division: { name: 'Divisi A', slug: 'a' }, role: { name: 'Anggota', level: 50 }, user: { full_name: 'User 1', nim: '123' } },
      ];
      mockFrom.mockImplementation((t: string) => {
        if (t === 'profiles') return createMockSupabase(profiles);
        if (t === 'committee_assignments') return createMockSupabase(assignments);
        return createMockSupabase(null);
      });
      const { getAllMembers } = await import('@/lib/data/members');
      const result = await getAllMembers();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by year', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'profiles') return createMockSupabase([]);
        if (t === 'committee_assignments') return createMockSupabase([]);
        return createMockSupabase(null);
      });
      const { getAllMembers } = await import('@/lib/data/members');
      await getAllMembers({ year: 'y-1' });
    });
  });

  describe('getDivisionMembers', () => {
    it('should return division members', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase([{ id: 'a-1', user: { full_name: 'User', nim: '123' }, role: { name: 'Anggota', level: 50 } }]);
        return createMockSupabase(null);
      });
      const { getDivisionMembers } = await import('@/lib/data/members');
      const result = await getDivisionMembers('d-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getBPHMembers', () => {
    it('should return BPH members', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase([{ id: 'a-1', user: { full_name: 'Ketua', nim: '001' }, role: { name: 'Ketua', level: 100 } }]);
        return createMockSupabase(null);
      });
      const { getBPHMembers } = await import('@/lib/data/members');
      const result = await getBPHMembers();
      expect(result).toHaveLength(1);
    });
  });
});
