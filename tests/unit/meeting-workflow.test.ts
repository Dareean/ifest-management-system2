import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('@/lib/internal-notifications', () => ({ notifyAllMembers: vi.fn().mockResolvedValue(undefined) }));

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

describe('Meeting Workflow Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('updateRsvp', () => {
    it('should update RSVP', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1' });
        if (t === 'meeting_invitees') return chain({ id: 'inv-1', committee_assignment_id: 'a-1' });
        return chain(null);
      });
      const { updateRsvp } = await import('@/lib/actions/meeting-workflow');
      expect(await updateRsvp('inv-1', 'accepted')).toEqual({ success: true });
    });
  });

  describe('markAttendance', () => {
    it('should mark attendance', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', scope: 'all' });
        if (t === 'meeting_invitees') return chain({ id: 'inv-1' });
        return chain(null);
      });
      const { markAttendance } = await import('@/lib/actions/meeting-workflow');
      expect(await markAttendance('m-1', 'inv-1', 'accepted')).toEqual({ success: true });
    });
  });

  describe('saveNotes', () => {
    it('should save new notes', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', scope: 'all' });
        if (t === 'meeting_notes') return chain(null);
        return chain(null);
      });
      const { saveNotes } = await import('@/lib/actions/meeting-workflow');
      const fd = new FormData(); fd.append('meetingId', 'm-1'); fd.append('content', 'Notes');
      expect(await saveNotes(null, fd)).toEqual({ success: true });
    });

    it('should update existing notes', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', scope: 'all' });
        if (t === 'meeting_notes') return chain({ id: 'mn-1', content: 'old' });
        return chain(null);
      });
      const { saveNotes } = await import('@/lib/actions/meeting-workflow');
      const fd = new FormData(); fd.append('meetingId', 'm-1'); fd.append('content', 'Updated notes');
      expect(await saveNotes(null, fd)).toEqual({ success: true });
    });
  });

  describe('publishNotes', () => {
    it('should publish notes', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', scope: 'all', title: 'Meeting 1' });
        if (t === 'meeting_notes') return chain(null);
        return chain(null);
      });
      const { publishNotes } = await import('@/lib/actions/meeting-workflow');
      expect(await publishNotes('m-1')).toEqual({ success: true });
    });
  });

  describe('endMeeting', () => {
    it('should end meeting', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', role: { is_approver: true } });
        if (t === 'meetings') return chain({ id: 'm-1', creator_id: 'a-1', scope: 'all' });
        return chain(null);
      });
      const { endMeeting } = await import('@/lib/actions/meeting-workflow');
      expect(await endMeeting('m-1')).toEqual({ success: true });
    });
  });
});
