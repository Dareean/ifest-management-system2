import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'lte', 'not', 'or', 'ilike'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('Letters Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getLetters', () => {
    it('should return letters array', async () => {
      const letters = [{ id: 'l-1', letter_type: 'Surat', subject: 'Test', status: 'sent', priority: 'tinggi', category: 'eksternal', division: { name: 'Div A' }, requester: { user: { full_name: 'User' } } }];
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') return createMockSupabase(letters);
        return createMockSupabase(null);
      });
      const { getLetters } = await import('@/lib/data/letters');
      const result = await getLetters();
      expect(result).toHaveLength(1);
    });

    it('should filter by requesterId', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') return createMockSupabase([]);
        return createMockSupabase(null);
      });
      const { getLetters } = await import('@/lib/data/letters');
      const result = await getLetters('user-1');
      expect(result).toEqual([]);
    });

    it('should return empty on error', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') {
          const chain: any = {};
          ['select', 'eq', 'order'].forEach(m => { chain[m] = vi.fn(() => chain); });
          chain.then = (resolve: any) => resolve({ data: null, error: new Error('fail') });
          return chain;
        }
        return createMockSupabase(null);
      });
      const { getLetters } = await import('@/lib/data/letters');
      expect(await getLetters()).toEqual([]);
    });
  });

  describe('getStatusDisplay', () => {
    it('should return display for sent', async () => {
      const { getStatusDisplay } = await import('@/lib/data/letters');
      const d = getStatusDisplay('sent');
      expect(d.label).toBeTruthy();
    });

    it('should return display for unknown', async () => {
      const { getStatusDisplay } = await import('@/lib/data/letters');
      const d = getStatusDisplay('unknown');
      expect(d.label).toBeTruthy();
    });
  });

  describe('getPriorityDisplay', () => {
    it('should return display for tinggi', async () => {
      const { getPriorityDisplay } = await import('@/lib/data/letters');
      const d = getPriorityDisplay('tinggi');
      expect(d.label).toBeTruthy();
    });
  });
});
