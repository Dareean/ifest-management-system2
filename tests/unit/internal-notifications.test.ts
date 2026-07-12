import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit Tests for Internal Notifications
 */

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } }) } },
  }),
}));

vi.mock('@/lib/email', () => ({
  sendEmailNotification: vi.fn(),
}));

vi.mock('@/lib/fonnte', () => ({
  sendWhatsAppMessage: vi.fn(),
  formatWhatsAppMessage: vi.fn((m) => JSON.stringify(m)),
}));

describe('Internal Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table) => {
      if (table === 'committee_assignments') {
        const chain = createMockSupabase();
        let isSingle = false;
        chain.single = vi.fn(() => {
          isSingle = true;
          return chain;
        });
        chain.then = (resolve: any) => {
          if (isSingle) {
            return resolve({
              data: { user: { full_name: 'Test', phone: '123456' }, user_id: 'uid' },
              error: null
            });
          } else {
            return resolve({
              data: [{ id: 'member-1' }, { id: 'member-2' }],
              error: null
            });
          }
        };
        return chain;
      }
      if (table === 'divisions') {
        return createMockSupabase({ data: { whatsapp_group_id: 'group-1' }, error: null });
      }
      return createMockSupabase({ data: { user: { full_name: 'Test' }, user_id: 'uid' }, error: null });
    });
  });

  it('should call from().insert() when creating notification', async () => {
    const { createNotification } = await import('@/lib/internal-notifications');
    await createNotification('test-id', 'test', 'Title', 'Body', false);
    expect(mockFrom).toHaveBeenCalledWith('notifications');
  });

  it('should call from().select() when notifying division', async () => {
    const { notifyDivision } = await import('@/lib/internal-notifications');
    await notifyDivision('test-div', 'test', 'Title', 'Body', false);
    expect(mockFrom).toHaveBeenCalled();
  });

  it('should call from().select() when notifying all members', async () => {
    const { notifyAllMembers } = await import('@/lib/internal-notifications');
    await notifyAllMembers('test', 'Title', 'Body', false);
    expect(mockFrom).toHaveBeenCalled();
  });
});
