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

describe('Meeting Detail Data', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('getMeetingDetail', () => {
    it('should return null on empty', async () => {
      mockFrom.mockReturnValue(createMockSupabase(null));
      const { getMeetingDetail } = await import('@/lib/data/meeting-detail');
      expect(await getMeetingDetail('m-1')).toBeNull();
    });

    it('should return meeting detail with invitation notes', async () => {
      const meetingData = {
        id: 'm-1', title: 'Meeting 1', agenda: 'Agenda', meeting_type: 'scheduled',
        meeting_link: null, location: 'Room A',
        started_at: '2026-07-15T10:00:00Z', ended_at: null,
        scope: 'all', status: 'akan_datang', division_id: null,
        created_at: '2026-07-10T00:00:00Z', updated_at: '2026-07-10T00:00:00Z',
        creator: { user: { full_name: 'Creator', id: 'c-1' } },
        meeting_notes: { id: 'mn-1', content: 'Notes', created_at: '2026-07-15T11:00:00Z' },
        meeting_invitations: [
          { id: 'inv-1', status: 'hadir', user: { id: 'u-1', full_name: 'User 1' }, notes: null },
        ],
        division: null,
      };
      mockFrom.mockImplementation((t: string) => {
        if (t === 'meetings') return createMockSupabase(meetingData);
        return createMockSupabase(null);
      });
      const { getMeetingDetail } = await import('@/lib/data/meeting-detail');
      const result = await getMeetingDetail('m-1');
      expect(result).toBeTruthy();
      expect(result!.id).toBe('m-1');
    });
  });
});
