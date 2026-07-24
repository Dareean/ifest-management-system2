import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();
const mockGetUserById = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: mockGetUserById } },
  }),
}));

const mockSendEmailNotification = vi.fn();
vi.mock('@/lib/email', () => ({
  sendEmailNotification: mockSendEmailNotification,
}));

function setupCommitteeAssignmentsMock(overrides?: { userData?: any; membersData?: any }) {
  const { userData = null, membersData = null } = overrides ?? {};
  return () => {
    const chain = createMockSupabase();
    let isSingle = false;
    chain.single = vi.fn(() => { isSingle = true; return chain; });
    chain.in = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.gte = vi.fn(() => chain);
    chain.then = (resolve: any) => {
      if (userData && isSingle) return resolve({ data: userData, error: null });
      if (membersData) return resolve({ data: membersData, error: null });
      if (isSingle) return resolve({ data: { user: { full_name: 'Test User', phone: '081234567890' }, user_id: 'uid' }, error: null });
      return resolve({ data: [{ id: 'member-1' }, { id: 'member-2' }], error: null });
    };
    return chain;
  };
}

async function flushAsync() {
  await new Promise(resolve => setTimeout(resolve, 50));
}

describe('Internal Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } }, error: null });
  });

  describe('createNotification', () => {
    it('should insert in-app notification', async () => {
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'test', 'Title', 'Body', false);
      await flushAsync();

      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });

    it('should send email when urgent', async () => {
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'task', 'Task Title', 'Task Body', true);
      await flushAsync();

      expect(mockSendEmailNotification).toHaveBeenCalled();
    });

    it('should format task-type email correctly', async () => {
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'task', 'New Task', 'Task details', true);
      await flushAsync();

      const html = mockSendEmailNotification.mock.calls[0]?.[3];
      expect(html).toContain('tugas baru');
    });

    it('should format meeting-type email correctly', async () => {
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'meeting', 'Meeting Invite', 'Meeting details', true);
      await flushAsync();

      const html = mockSendEmailNotification.mock.calls[0]?.[3];
      expect(html).toContain('Undangan rapat');
    });

    it('should format letter-type email correctly', async () => {
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'letter', 'Letter Update', 'Letter details', true);
      await flushAsync();

      const html = mockSendEmailNotification.mock.calls[0]?.[3];
      expect(html).toContain('Pembaruan surat');
    });

    it('should handle missing email gracefully', async () => {
      mockGetUserById.mockResolvedValue({ data: { user: null }, error: null });
      const committeeMock = setupCommitteeAssignmentsMock();
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return committeeMock();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { createNotification } = await import('@/lib/internal-notifications');
      await createNotification('test-id', 'test', 'Title', 'Body', true);
      await flushAsync();

      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });
  });

  describe('notifyDivision', () => {
    it('should send emails when urgent', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return setupCommitteeAssignmentsMock()();
        if (table === 'divisions') return createMockSupabase({ data: { whatsapp_group_id: null }, error: null });
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { notifyDivision } = await import('@/lib/internal-notifications');
      await notifyDivision('div-1', 'task', 'Task Title', 'Task Body', true);
      await flushAsync();

      expect(mockSendEmailNotification).toHaveBeenCalled();
    });
  });

  describe('notifyAllMembers', () => {
    it('should send emails when urgent', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return setupCommitteeAssignmentsMock()();
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({
          data: [{ whatsapp_group_id: 'group-a' }],
          error: null,
        });
      });

      const { notifyAllMembers } = await import('@/lib/internal-notifications');
      await notifyAllMembers('meeting', 'Meeting', 'Body', true);
      await flushAsync();

      expect(mockSendEmailNotification).toHaveBeenCalled();
    });

    it('should handle no active members', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'committee_assignments') return createMockSupabase({ data: [], error: null });
        if (table === 'notifications') return createMockSupabase({ data: [{ id: 'notif-1' }], error: null });
        return createMockSupabase({ data: null, error: null });
      });

      const { notifyAllMembers } = await import('@/lib/internal-notifications');
      await notifyAllMembers('test', 'Title', 'Body', false);
      await flushAsync();

      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });
  });
});
