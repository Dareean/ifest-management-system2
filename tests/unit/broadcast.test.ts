import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();
const mockListUsers = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: {
      admin: {
        listUsers: mockListUsers,
      }
    }
  }),
}));

const mockRequireRole = vi.fn();
vi.mock('@/lib/auth/authorize', () => ({
  requireRole: mockRequireRole,
}));

const mockSendBroadcastEmail = vi.fn();
vi.mock('@/lib/email', () => ({
  sendBroadcastEmail: mockSendBroadcastEmail,
}));

describe('Broadcast Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if user does not have level 100 access (not PIC)', async () => {
    mockRequireRole.mockResolvedValue({ authorized: false, error: 'Akses ditolak' });

    const { sendBroadcastEmailAction } = await import('@/lib/actions/broadcast');
    const formData = new FormData();
    formData.append('subject', 'Test Subject');
    formData.append('body', 'Test Body');

    const result = await sendBroadcastEmailAction(null, formData);
    expect(result).toEqual({ error: 'Akses ditolak' });
    expect(mockRequireRole).toHaveBeenCalledWith(100);
  });

  it('should return error if subject is empty', async () => {
    mockRequireRole.mockResolvedValue({ authorized: true, session: { roleLevel: 100 } });

    const { sendBroadcastEmailAction } = await import('@/lib/actions/broadcast');
    const formData = new FormData();
    formData.append('subject', '');
    formData.append('body', 'Test Body');

    const result = await sendBroadcastEmailAction(null, formData);
    expect(result).toEqual({ error: 'Subjek email harus diisi' });
  });

  it('should return error if body is empty', async () => {
    mockRequireRole.mockResolvedValue({ authorized: true, session: { roleLevel: 100 } });

    const { sendBroadcastEmailAction } = await import('@/lib/actions/broadcast');
    const formData = new FormData();
    formData.append('subject', 'Test Subject');
    formData.append('body', '');

    const result = await sendBroadcastEmailAction(null, formData);
    expect(result).toEqual({ error: 'Isi pesan email harus diisi' });
  });

  it('should fetch members and broadcast emails successfully', async () => {
    mockRequireRole.mockResolvedValue({ authorized: true, session: { roleLevel: 100 } });

    // Mock committee assignments query
    mockFrom.mockImplementation((table) => {
      if (table === 'committee_assignments') {
        return createMockSupabase({
          data: [
            { user_id: 'user-1' },
            { user_id: 'user-2' }
          ],
          error: null
        });
      }
      if (table === 'profiles') {
        return createMockSupabase({
          data: [
            { id: 'user-1', full_name: 'Member One' },
            { id: 'user-2', full_name: 'Member Two' }
          ],
          error: null
        });
      }
      return createMockSupabase({ data: [], error: null });
    });

    // Mock auth.users list
    mockListUsers.mockResolvedValue({
      data: {
        users: [
          { id: 'user-1', email: 'member1@test.com' },
          { id: 'user-2', email: 'member2@test.com' }
        ]
      },
      error: null
    });

    const { sendBroadcastEmailAction } = await import('@/lib/actions/broadcast');
    const formData = new FormData();
    formData.append('subject', 'Important Announcement');
    formData.append('boxTitle', 'ANNOUNCEMENT');
    formData.append('body', 'Hello panitia!');

    const result = await sendBroadcastEmailAction(null, formData);
    expect(result).toEqual({ success: true, count: 2 });

    expect(mockSendBroadcastEmail).toHaveBeenCalledTimes(2);
    expect(mockSendBroadcastEmail).toHaveBeenNthCalledWith(
      1,
      'member1@test.com',
      'Member One',
      'Important Announcement',
      'ANNOUNCEMENT',
      'Hello panitia!'
    );
    expect(mockSendBroadcastEmail).toHaveBeenNthCalledWith(
      2,
      'member2@test.com',
      'Member Two',
      'Important Announcement',
      'ANNOUNCEMENT',
      'Hello panitia!'
    );
  });
});
