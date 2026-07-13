import { describe, it, expect } from 'vitest';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', async () => {
      const { cn } = await import('@/lib/utils');
      expect(cn('a', 'b')).toBe('a b');
    });

    it('should handle conditional classes', async () => {
      const { cn } = await import('@/lib/utils');
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });
  });
});
