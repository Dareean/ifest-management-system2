import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'lte', 'not'].forEach(m => { chain[m] = vi.fn(() => chain); });
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

describe('Notifications Data', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getUserNotifications', () => {
    it('should return notifications', async () => {
      const notifs = [
        { id: 'n-1', type: 'info', title: 'Notif 1', body: 'Message', is_read: false, email_sent: false, created_at: '2026-07-01T00:00:00Z' },
      ];
      let callCount = 0;
      mockFrom.mockImplementation((t: string) => {
        callCount++;
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'notifications') return createMockSupabase(notifs);
        return createMockSupabase(null);
      });
      const { getUserNotifications } = await import('@/lib/data/notifications');
      const result = await getUserNotifications();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Notif 1');
    });

    it('should return empty on no assignment', async () => {
      mockFrom.mockReturnValue(createMockSupabase(null));
      const { getUserNotifications } = await import('@/lib/data/notifications');
      expect(await getUserNotifications()).toEqual([]);
    });

    it('should return empty on no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { getUserNotifications } = await import('@/lib/data/notifications');
      expect(await getUserNotifications()).toEqual([]);
    });

    it('should respect limit', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'notifications') return createMockSupabase([]);
        return createMockSupabase(null);
      });
      const { getUserNotifications } = await import('@/lib/data/notifications');
      await getUserNotifications(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({ id: 'a-1' });
        if (t === 'notifications') {
          const chain: any = {};
          ['select', 'eq', 'single', 'order', 'limit'].forEach(m => { chain[m] = vi.fn(() => chain); });
          chain.then = (resolve: any) => resolve({ count: 3, error: null });
          return chain;
        }
        return createMockSupabase(null);
      });
      const { getUnreadCount } = await import('@/lib/data/notifications');
      expect(await getUnreadCount()).toBe(3);
    });

    it('should return 0 on no assignment', async () => {
      mockFrom.mockReturnValue(createMockSupabase(null));
      const { getUnreadCount } = await import('@/lib/data/notifications');
      expect(await getUnreadCount()).toBe(0);
    });
  });
});
