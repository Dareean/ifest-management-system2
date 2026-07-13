import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

describe('Letter Detail Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getLetterDetail', () => {
    it('should return null on empty data', async () => {
      mockFrom.mockReturnValue(createMockSupabase(null));
      const { getLetterDetail } = await import('@/lib/data/letter-detail');
      expect(await getLetterDetail('l-1')).toBeNull();
    });

    it('should return letter detail', async () => {
      const letterData = {
        id: 'l-1', letter_type: 'Surat Permohonan', subject: 'Test', body: '<p>Test</p>',
        status: 'sent', priority: 'tinggi', category: 'eksternal',
        revision_count: 0, final_document_url: null,
        deadline_at: '2026-12-31', target_institution: 'UNIV',
        request_options: null, created_at: '2026-07-01T00:00:00Z', updated_at: '2026-07-01T00:00:00Z',
        division: { name: 'Divisi A' },
        requester: { user: { full_name: 'User' } },
        handler: { user: { full_name: 'Handler' } },
      };
      mockFrom.mockImplementation((t: string) => {
        if (t === 'letter_requests') return createMockSupabase(letterData);
        if (t === 'letter_revisions') return createMockSupabase([]);
        return createMockSupabase(null);
      });
      const { getLetterDetail } = await import('@/lib/data/letter-detail');
      const result = await getLetterDetail('l-1');
      expect(result).toBeTruthy();
      expect(result!.letterType).toBe('Surat Permohonan');
    });
  });
});
