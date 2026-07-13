import { describe, it, expect } from 'vitest';

describe('Calendar Utils', () => {
  describe('generateGoogleCalendarUrl', () => {
    it('should generate a valid Google Calendar URL', async () => {
      const { generateGoogleCalendarUrl } = await import('@/lib/utils/calendar');
      const url = generateGoogleCalendarUrl({
        title: 'Rapat',
        description: 'Deskripsi rapat',
        location: 'Room A',
        startedAt: '2026-07-15T10:00:00Z',
      });
      expect(url).toContain('https://calendar.google.com/calendar/render');
      expect(url).toContain('Rapat');
    });

    it('should include optional endedAt', async () => {
      const { generateGoogleCalendarUrl } = await import('@/lib/utils/calendar');
      const url = generateGoogleCalendarUrl({
        title: 'Rapat',
        startedAt: '2026-07-15T10:00:00Z',
        endedAt: '2026-07-15T12:00:00Z',
      });
      expect(url).toContain('calendar.google.com');
    });

    it('should handle null description and location', async () => {
      const { generateGoogleCalendarUrl } = await import('@/lib/utils/calendar');
      const url = generateGoogleCalendarUrl({
        title: 'Rapat',
        startedAt: '2026-07-15T10:00:00Z',
      });
      expect(url).toContain('calendar.google.com');
    });
  });
});
