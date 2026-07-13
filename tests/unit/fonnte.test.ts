import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Fonnte (WhatsApp)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('sendWhatsAppMessage', () => {
    it('should send message and return response on success', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ status: true }) });
      const { sendWhatsAppMessage } = await import('@/lib/fonnte');
      const result = await sendWhatsAppMessage({ phone: '081234', message: 'Test' });
      expect(result.status).toBe(true);
    });

    it('should return false on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { sendWhatsAppMessage } = await import('@/lib/fonnte');
      const result = await sendWhatsAppMessage({ phone: '081234', message: 'Test' });
      expect(result.status).toBe(false);
    });

    it('should return false on API error', async () => {
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({ status: false, message: 'API Error' }) });
      const { sendWhatsAppMessage } = await import('@/lib/fonnte');
      const result = await sendWhatsAppMessage({ phone: '081234', message: 'Test' });
      expect(result.status).toBe(false);
    });

    it('should return false when token is missing', async () => {
      const prevToken = process.env.FONNTE_API_TOKEN;
      delete process.env.FONNTE_API_TOKEN;
      const { sendWhatsAppMessage } = await import('@/lib/fonnte');
      const result = await sendWhatsAppMessage({ phone: '081234', message: 'Test' });
      expect(result.status).toBe(false);
      expect(result.message).toContain('token');
      process.env.FONNTE_API_TOKEN = prevToken;
    });

    it('should include url in formData when provided', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ status: true }) });
      const { sendWhatsAppMessage } = await import('@/lib/fonnte');
      const result = await sendWhatsAppMessage({ phone: '081234', message: 'Test', url: 'https://example.com/img.jpg' });
      expect(result.status).toBe(true);
    });
  });

  describe('sendBulkWhatsApp', () => {
    it('should send bulk message and return success count', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ status: true }) });
      const { sendBulkWhatsApp } = await import('@/lib/fonnte');
      const result = await sendBulkWhatsApp({ phones: ['0811', '0812'], message: 'Bulk test' });
      expect(result.successCount).toBe(2);
    });

    it('should return all failed when token missing', async () => {
      const prevToken = process.env.FONNTE_API_TOKEN;
      delete process.env.FONNTE_API_TOKEN;
      const { sendBulkWhatsApp } = await import('@/lib/fonnte');
      const result = await sendBulkWhatsApp({ phones: ['0811'], message: 'Test' });
      expect(result.failedCount).toBe(1);
      expect(result.failedPhones).toEqual(['0811']);
      process.env.FONNTE_API_TOKEN = prevToken;
    });

    it('should return failed on API error', async () => {
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({ status: false }) });
      const { sendBulkWhatsApp } = await import('@/lib/fonnte');
      const result = await sendBulkWhatsApp({ phones: ['0811'], message: 'Test' });
      expect(result.failedCount).toBe(1);
    });

    it('should return failed on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { sendBulkWhatsApp } = await import('@/lib/fonnte');
      const result = await sendBulkWhatsApp({ phones: ['0811'], message: 'Test' });
      expect(result.failedCount).toBe(1);
    });

    it('should include url in formData when provided', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ status: true }) });
      const { sendBulkWhatsApp } = await import('@/lib/fonnte');
      const result = await sendBulkWhatsApp({ phones: ['0811'], message: 'Test', url: 'https://example.com/doc.pdf' });
      expect(result.successCount).toBe(1);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format local number (starts with 0)', async () => {
      const { formatPhoneNumber } = await import('@/lib/fonnte');
      expect(formatPhoneNumber('081234567890')).toBe('6281234567890');
    });

    it('should handle number with +62 prefix', async () => {
      const { formatPhoneNumber } = await import('@/lib/fonnte');
      expect(formatPhoneNumber('+6281234567890')).toBe('6281234567890');
    });

    it('should handle number already starting with 62', async () => {
      const { formatPhoneNumber } = await import('@/lib/fonnte');
      expect(formatPhoneNumber('6281234567890')).toBe('6281234567890');
    });

    it('should strip non-digit characters', async () => {
      const { formatPhoneNumber } = await import('@/lib/fonnte');
      expect(formatPhoneNumber('0812-3456-7890')).toBe('6281234567890');
    });
  });

  describe('formatWhatsAppMessage', () => {
    it('should format message with title body and footer', async () => {
      const { formatWhatsAppMessage } = await import('@/lib/fonnte');
      const msg = formatWhatsAppMessage({ title: 'Test', body: 'Body text', footer: 'Footer' });
      expect(msg).toContain('Test');
      expect(msg).toContain('Body');
      expect(msg).toContain('Footer');
    });

    it('should format message without footer', async () => {
      const { formatWhatsAppMessage } = await import('@/lib/fonnte');
      const msg = formatWhatsAppMessage({ title: 'Test', body: 'Body text' });
      expect(msg).toContain('Test');
      expect(msg).toContain('Body');
      expect(msg).not.toContain('Footer');
    });
  });
});
