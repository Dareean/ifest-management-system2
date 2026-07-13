import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'lte', 'not'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('Admin Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getDivisionsWithMembers', () => {
    it('should return divisions with members', async () => {
      const divs = [{ id: 'd-1', name: 'Divisi A', slug: 'a' }];
      mockFrom.mockImplementation((t: string) => {
        if (t === 'divisions') return createMockSupabase(divs);
        if (t === 'committee_assignments') return createMockSupabase([]);
        return createMockSupabase(null);
      });
      const { getDivisionsWithMembers } = await import('@/lib/data/admin-data');
      const result = await getDivisionsWithMembers();
      expect(result).toHaveLength(1);
    });
  });

  describe('getRoles', () => {
    it('should return roles', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'roles') return createMockSupabase([{ name: 'Ketua', slug: 'ketua', level: 100 }]);
        return createMockSupabase(null);
      });
      const { getRoles } = await import('@/lib/data/admin-data');
      const roles = await getRoles();
      expect(roles).toHaveLength(1);
    });
  });

  describe('getYears', () => {
    it('should return all years', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_years') return createMockSupabase([{ id: 'y-1', label: '2026' }]);
        return createMockSupabase(null);
      });
      const { getYears } = await import('@/lib/data/admin-data');
      const years = await getYears();
      expect(years).toHaveLength(1);
    });
  });

  describe('getAssignments', () => {
    it('should return assignments', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase([{ id: 'a-1', user: { full_name: 'User' }, division: { name: 'Divisi A' }, role: { name: 'Anggota' } }]);
        return createMockSupabase(null);
      });
      const { getAssignments } = await import('@/lib/data/admin-data');
      const result = await getAssignments();
      expect(result).toHaveLength(1);
    });
  });
});
