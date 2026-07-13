import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

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

describe('Notifications Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('markNotificationRead', () => {
    it('should mark notification as read', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        return createMockSupabase(null);
      });
      const { markNotificationRead } = await import('@/lib/actions/notifications');
      await markNotificationRead('notif-1');
    });
  });

  describe('markAllNotificationsRead', () => {
    it('should mark all as read', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        return createMockSupabase(null);
      });
      const { markAllNotificationsRead } = await import('@/lib/actions/notifications');
      await markAllNotificationsRead();
    });
  });
});
