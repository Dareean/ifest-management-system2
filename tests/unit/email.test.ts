import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests for Email Functions
 *
 * Tests email utility functions with mocked Brevo API
 */

// Mock Brevo API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
const { sendWelcomeEmail, sendLetterNotification, sendMeetingInvite, sendEmailNotification } = await import('@/lib/email');

describe('Email Functions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: 'test-message-id' }),
      text: async () => 'Success',
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct parameters', async () => {
      const email = 'test@test.ifest.local';
      const name = 'Test User';
      const password = 'TempPassword123!';

      await sendWelcomeEmail(email, name, password);

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify API endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': expect.any(String),
            'Content-Type': 'application/json',
          }),
        })
      );

      // Verify email content
      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.to[0].email).toBe(email);
      expect(body.to[0].name).toBe(name);
      expect(body.subject).toContain('Selamat Datang');
      expect(body.htmlContent).toContain(name);
      expect(body.htmlContent).toContain(password);
    });

    it('should include login credentials in email body', async () => {
      await sendWelcomeEmail('test@test.ifest.local', 'Test User', 'Pass123!');

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.htmlContent).toContain('test@test.ifest.local');
      expect(body.htmlContent).toContain('Pass123!');
      expect(body.htmlContent).toContain('Login ke Dashboard');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      } as Response);

      // Should not throw error
      await expect(
        sendWelcomeEmail('test@test.ifest.local', 'Test User', 'Pass123!')
      ).resolves.not.toThrow();
    });
  });

  describe('sendLetterNotification', () => {
    it('should send letter notification with correct status', async () => {
      const email = 'test@test.ifest.local';
      const name = 'Test User';
      const subject = 'Surat Permohonan Dana';
      const letterType = 'Surat Permohonan';
      const letterSubject = 'Permohonan Dana Event';
      const status = 'approved';

      await sendLetterNotification(email, name, subject, letterType, letterSubject, status);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.to[0].email).toBe(email);
      expect(body.subject).toContain(letterSubject);
      expect(body.htmlContent).toContain(letterSubject);
      expect(body.htmlContent).toContain(letterType);
      expect(body.htmlContent).toContain('disetujui'); // status label
    });

    it('should format different statuses correctly', async () => {
      const statuses = [
        { status: 'requested', label: 'diajukan' },
        { status: 'in_revision', label: 'direvisi' },
        { status: 'approved', label: 'disetujui' },
        { status: 'sent', label: 'dikirim' },
      ];

      for (const { status, label } of statuses) {
        mockFetch.mockClear();
        await sendLetterNotification(
          'test@test.ifest.local',
          'Test User',
          'Test Subject',
          'Surat Permohonan',
          'Test Letter',
          status
        );

        const callArgs = mockFetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.htmlContent).toContain(label);
      }
    });
  });

  describe('sendMeetingInvite', () => {
    it('should send meeting invite with all details', async () => {
      const email = 'test@test.ifest.local';
      const name = 'Test User';
      const title = 'Rapat Koordinasi';
      const startedAt = new Date('2026-07-15T10:00:00Z').toISOString();
      const meetingLink = 'https://meet.google.com/test';
      const location = 'Ruang Rapat A';
      const agenda = 'Membahas proposal event';

      await sendMeetingInvite(email, name, title, startedAt, meetingLink, location, agenda);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.to[0].email).toBe(email);
      expect(body.subject).toContain(title);
      expect(body.htmlContent).toContain(title);
      expect(body.htmlContent).toContain(location);
      expect(body.htmlContent).toContain(meetingLink);
      expect(body.htmlContent).toContain(agenda);
    });

    it('should handle optional fields (no link, no agenda)', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local',
        'Test User',
        'Rapat Koordinasi',
        new Date().toISOString(),
        null,
        'Ruang Rapat A',
        null
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.htmlContent).toContain('Ruang Rapat A');
      expect(body.htmlContent).not.toContain('Tautan Online');
      expect(body.htmlContent).not.toContain('Agenda:');
    });

    it('should prioritize offline location over online link', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local',
        'Test User',
        'Rapat Koordinasi',
        new Date().toISOString(),
        'https://meet.google.com/test',
        'Ruang Rapat A',
        null
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      // Location should appear before link in HTML
      const locationIndex = body.htmlContent.indexOf('Lokasi:');
      const linkIndex = body.htmlContent.indexOf('Tautan Online:');
      expect(locationIndex).toBeLessThan(linkIndex);
    });
  });

  describe('sendEmailNotification', () => {
    it('should send generic notification email', async () => {
      const email = 'test@test.ifest.local';
      const name = 'Test User';
      const subject = 'Test Notification';
      const htmlContent = '<p>Test notification content</p>';

      await sendEmailNotification(email, name, subject, htmlContent);

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.to[0].email).toBe(email);
      expect(body.subject).toBe(subject);
      expect(body.htmlContent).toContain(htmlContent);
      expect(body.htmlContent).toContain(name);
    });
  });
});
