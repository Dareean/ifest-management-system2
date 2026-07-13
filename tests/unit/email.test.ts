import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const { sendWelcomeEmail, sendLetterNotification, sendMeetingInvite, sendEmailNotification, sendBroadcastEmail } = await import('@/lib/email');

describe('Email Functions', () => {
  beforeEach(() => {
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

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({ method: 'POST' })
      );

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

      await expect(
        sendWelcomeEmail('test@test.ifest.local', 'Test User', 'Pass123!')
      ).resolves.not.toThrow();
    });
  });

  describe('sendLetterNotification', () => {
    it('should send letter notification with correct status', async () => {
      await sendLetterNotification(
        'test@test.ifest.local', 'Test User', 'Surat Permohonan Dana',
        'Surat Permohonan', 'Permohonan Dana Event', 'approved'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.to[0].email).toBe('test@test.ifest.local');
      expect(body.subject).toContain('Permohonan Dana Event');
      expect(body.htmlContent).toContain('disetujui');
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
          'test@test.ifest.local', 'Test User', 'Test Subject',
          'Surat Permohonan', 'Test Letter', status
        );

        const callArgs = mockFetch.mock.calls[0][1];
        const body = JSON.parse(callArgs.body);
        expect(body.htmlContent).toContain(label);
      }
    });

    it('should handle unknown status with fallback', async () => {
      await sendLetterNotification(
        'test@test.ifest.local', 'Test User', 'Test Subject',
        'Surat Permohonan', 'Test Letter', 'unknown_status'
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.htmlContent).toContain('unknown_status');
    });
  });

  describe('sendMeetingInvite', () => {
    it('should send meeting invite with all details', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local', 'Test User', 'Rapat Koordinasi',
        new Date('2026-07-15T10:00:00Z').toISOString(),
        'https://meet.google.com/test', 'Ruang Rapat A', 'Membahas proposal'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.htmlContent).toContain('Rapat Koordinasi');
      expect(body.htmlContent).toContain('Ruang Rapat A');
      expect(body.htmlContent).toContain('https://meet.google.com/test');
    });

    it('should handle optional fields (no link, no agenda)', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local', 'Test User', 'Rapat Koordinasi',
        new Date().toISOString(), null, 'Ruang Rapat A', null
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.htmlContent).toContain('Ruang Rapat A');
      expect(body.htmlContent).not.toContain('Tautan Online');
      expect(body.htmlContent).not.toContain('Agenda:');
    });

    it('should prioritize offline location over online link', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local', 'Test User', 'Rapat Koordinasi',
        new Date().toISOString(),
        'https://meet.google.com/test', 'Ruang Rapat A', null
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      const locationIndex = body.htmlContent.indexOf('Lokasi:');
      const linkIndex = body.htmlContent.indexOf('Tautan Online:');
      expect(locationIndex).toBeLessThan(linkIndex);
    });

    it('should include Google Calendar link when meeting link is provided without location', async () => {
      await sendMeetingInvite(
        'test@test.ifest.local', 'Test User', 'Rapat Online',
        new Date().toISOString(),
        'https://meet.google.com/test', null, 'Agenda testing'
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.htmlContent).toContain('Google Calendar');
      expect(body.htmlContent).toContain('Tautan Online');
    });
  });

  describe('sendEmailNotification', () => {
    it('should send generic notification email', async () => {
      await sendEmailNotification(
        'test@test.ifest.local', 'Test User', 'Test Notification', '<p>Test content</p>'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.to[0].email).toBe('test@test.ifest.local');
      expect(body.subject).toBe('Test Notification');
      expect(body.htmlContent).toContain('<p>Test content</p>');
    });
  });

  describe('sendBroadcastEmail', () => {
    it('should send broadcast email with box title', async () => {
      await sendBroadcastEmail(
        'test@test.ifest.local', 'Test User', 'Broadcast Subject', 'ANNOUNCEMENT', 'Broadcast body here'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.to[0].email).toBe('test@test.ifest.local');
      expect(body.subject).toBe('Broadcast Subject');
      expect(body.htmlContent).toContain('ANNOUNCEMENT');
      expect(body.htmlContent).toContain('Broadcast body here');
    });

    it('should handle newlines in body', async () => {
      await sendBroadcastEmail(
        'test@test.ifest.local', 'Test User', 'Subject', 'Box', 'Line 1\nLine 2'
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.htmlContent).toContain('<br>');
    });
  });

  describe('error handling', () => {
    it('should handle fetch network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        sendWelcomeEmail('test@test.ifest.local', 'Test User', 'Pass123!')
      ).resolves.not.toThrow();
    });

    it('should handle fetch with ok false for all email types', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: async () => 'Server Error',
      } as Response);

      await expect(
        sendBroadcastEmail('test@test.ifest.local', 'Test User', 'Subject', 'Box', 'Body')
      ).resolves.not.toThrow();

      await expect(
        sendLetterNotification('test@test.ifest.local', 'Test User', 'Subj', 'Type', 'Letter', 'sent')
      ).resolves.not.toThrow();
    });
  });
});
