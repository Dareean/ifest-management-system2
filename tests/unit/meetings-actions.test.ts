import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom, auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } }) } } }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

vi.mock('@/lib/email', () => ({ sendMeetingInvite: vi.fn() }));

function chain(data: any = null) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'lte', 'not'].forEach(m => { c[m] = vi.fn(() => c); });
  if (Array.isArray(data)) {
    c.then = (resolve: any) => resolve({ data, count: data.length, error: null });
  } else {
    c.then = (resolve: any) => resolve({ data, count: data ? 1 : 0, error: null });
  }
  return c;
}

describe('Meetings Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('createMeeting', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { createMeeting } = await import('@/lib/actions/meetings');
      expect(await createMeeting(null, new FormData())).toEqual({ error: 'Unauthorized' });
    });

    it('should create meeting with invitees', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain([{ id: 'a-1', division_id: 'd-1' }]);
        if (t === 'meetings') return chain({ id: 'm-1' });
        if (t === 'meeting_invitees') return chain(null);
        if (t === 'notifications') return chain(null);
        return chain(null);
      });
      const { createMeeting } = await import('@/lib/actions/meetings');
      const fd = new FormData();
      fd.append('title', 'Rapat');
      fd.append('agenda', 'Agenda');
      fd.append('meetingType', 'offline');
      fd.append('location', 'Room A');
      fd.append('startedAt', '2026-07-15T10:00');
      fd.append('invitee_ids', JSON.stringify(['a-1']));
      expect(await createMeeting(null, fd)).toEqual({ success: true, meetingId: 'm-1' });
    });
  });

  describe('updateMeetingDate', () => {
    it('should return error if meeting not found', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1' });
        if (t === 'meetings') return chain(null);
        return chain(null);
      });
      const { updateMeetingDate } = await import('@/lib/actions/meetings');
      expect(await updateMeetingDate('m-1', '2026-07-16T10:00')).toEqual({ error: 'Rapat tidak ditemukan.' });
    });

    it('should update meeting date', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', title: 'Test' });
        return chain(null);
      });
      const { updateMeetingDate } = await import('@/lib/actions/meetings');
      expect(await updateMeetingDate('m-1', '2026-07-16T10:00')).toEqual({ success: true });
    });
  });
});
