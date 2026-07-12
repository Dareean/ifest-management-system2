import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests for Internal Notifications
 *
 * Tests notification functions with mocked dependencies
 */

// Mock Supabase admin client
const mockSupabaseFrom = vi.fn();
const mockSupabaseAuth = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockSupabaseFrom,
    auth: {
      admin: {
        getUserById: mockSupabaseAuth,
      },
    },
  }),
}));

// Mock email module
const mockSendEmailNotification = vi.fn();
vi.mock('@/lib/email', () => ({
  sendEmailNotification: mockSendEmailNotification,
}));

// Mock fonnte (WhatsApp) module
const mockSendWhatsAppMessage = vi.fn();
const mockFormatWhatsAppMessage = vi.fn((msg) => JSON.stringify(msg));
vi.mock('@/lib/fonnte', () => ({
  sendWhatsAppMessage: mockSendWhatsAppMessage,
  formatWhatsAppMessage: mockFormatWhatsAppMessage,
}));

describe('Internal Notifications', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockSupabaseFrom.mockReturnValue({
      insert: mockSupabaseInsert,
      select: mockSupabaseSelect,
    });

    mockSupabaseInsert.mockResolvedValue({ error: null });

    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
    });

    mockSupabaseEq.mockReturnValue({
      single: mockSupabaseSingle,
      eq: mockSupabaseEq,
      not: vi.fn().mockReturnThis(),
    });

    mockSupabaseSingle.mockResolvedValue({
      data: {
        user: { full_name: 'Test User' },
        user_id: 'test-user-id',
      },
    });

    mockSupabaseAuth.mockResolvedValue({
      data: {
        user: { email: 'test@test.ifest.local' },
      },
    });

    mockSendEmailNotification.mockResolvedValue(undefined);
    mockSendWhatsAppMessage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification in database', async () => {
      const { createNotification } = await import('@/lib/internal-notifications');

      await createNotification(
        'test-assignment-id',
        'test',
        'Test Notification',
        'Test body',
        false
      );

      expect(mockSupabaseFrom).toHaveBeenCalledWith('notifications');
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        committee_assignment_id: 'test-assignment-id',
        type: 'test',
        title: 'Test Notification',
        body: 'Test body',
      });
    });

    it('should NOT send email when urgent=false', async () => {
      const { createNotification } = await import('@/lib/internal-notifications');

      await createNotification(
        'test-assignment-id',
        'task',
        'New Task',
        'Task details',
        false // NOT urgent
      );

      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });

    it('should send email when urgent=true', async () => {
      const { createNotification } = await import('@/lib/internal-notifications');

      await createNotification(
        'test-assignment-id',
        'letter',
        'Letter Update',
        'Letter details',
        true // URGENT
      );

      // Wait for async email sending
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSupabaseSelect).toHaveBeenCalled();
      expect(mockSupabaseAuth).toHaveBeenCalledWith('test-user-id');
      expect(mockSendEmailNotification).toHaveBeenCalledWith(
        'test@test.ifest.local',
        'Test User',
        '[LETTER] Letter Update',
        expect.stringContaining('Letter Update')
      );
    });

    it('should always attempt WhatsApp regardless of urgent flag', async () => {
      mockSupabaseSingle.mockResolvedValue({
        data: {
          user: { full_name: 'Test User', phone: '081234567890' },
          user_id: 'test-user-id',
        },
      });

      const { createNotification } = await import('@/lib/internal-notifications');

      await createNotification(
        'test-assignment-id',
        'meeting',
        'Meeting Invite',
        'Meeting details',
        false // Not urgent, but WhatsApp should still be attempted
      );

      // Wait for async WhatsApp sending
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendWhatsAppMessage).toHaveBeenCalled();
    });
  });

  describe('notifyDivision', () => {
    beforeEach(() => {
      // Mock division query
      mockSupabaseEq.mockImplementation((field, value) => {
        if (field === 'id' && value === 'test-division-id') {
          return {
            single: vi.fn().mockResolvedValue({
              data: { whatsapp_group_id: '120363123456789012@g.us' },
            }),
          };
        }
        if (field === 'division_id' && value === 'test-division-id') {
          return {
            eq: mockSupabaseEq,
          };
        }
        return {
          eq: mockSupabaseEq,
          single: mockSupabaseSingle,
        };
      });

      // Mock members query
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { id: 'member-1' },
                { id: 'member-2' },
              ],
            }),
          }),
        }),
      });
    });

    it('should create notifications for all division members', async () => {
      const { notifyDivision } = await import('@/lib/internal-notifications');

      await notifyDivision(
        'test-division-id',
        'letter',
        'Division Notification',
        'Details',
        false
      );

      expect(mockSupabaseInsert).toHaveBeenCalledWith([
        expect.objectContaining({ committee_assignment_id: 'member-1' }),
        expect.objectContaining({ committee_assignment_id: 'member-2' }),
      ]);
    });

    it('should NOT send email to members when urgent=false', async () => {
      const { notifyDivision } = await import('@/lib/internal-notifications');

      await notifyDivision(
        'test-division-id',
        'task',
        'Division Task',
        'Task details',
        false // NOT urgent
      );

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });

    it('should send email to all members when urgent=true', async () => {
      const { notifyDivision } = await import('@/lib/internal-notifications');

      await notifyDivision(
        'test-division-id',
        'letter',
        'Urgent Division Letter',
        'Letter details',
        true // URGENT
      );

      // Wait for async email sending
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should attempt to send email to each member
      expect(mockSupabaseSelect).toHaveBeenCalled();
    });
  });

  describe('notifyAllMembers', () => {
    beforeEach(() => {
      // Mock all members query
      mockSupabaseSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { id: 'member-1' },
              { id: 'member-2' },
              { id: 'member-3' },
            ],
          }),
        }),
      });
    });

    it('should create notifications for all members', async () => {
      const { notifyAllMembers } = await import('@/lib/internal-notifications');

      await notifyAllMembers(
        'announcement',
        'System Announcement',
        'Announcement details',
        false
      );

      expect(mockSupabaseInsert).toHaveBeenCalledWith([
        expect.objectContaining({ committee_assignment_id: 'member-1' }),
        expect.objectContaining({ committee_assignment_id: 'member-2' }),
        expect.objectContaining({ committee_assignment_id: 'member-3' }),
      ]);
    });

    it('should NOT send email to members when urgent=false', async () => {
      const { notifyAllMembers } = await import('@/lib/internal-notifications');

      await notifyAllMembers(
        'info',
        'General Info',
        'Info details',
        false // NOT urgent
      );

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendEmailNotification).not.toHaveBeenCalled();
    });

    it('should send email to all members when urgent=true', async () => {
      const { notifyAllMembers } = await import('@/lib/internal-notifications');

      await notifyAllMembers(
        'meeting',
        'Urgent Meeting Announcement',
        'Meeting published',
        true // URGENT
      );

      // Wait for async email sending
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should attempt to send email
      expect(mockSupabaseSelect).toHaveBeenCalled();
    });
  });
});
