import { describe, it, expect, vi } from 'vitest';

const mockUpdateSession = vi.fn();
vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: mockUpdateSession,
}));

describe('Middleware', () => {
  it('should export config', async () => {
    const mod = await import('@/middleware');
    expect(mod.config).toBeDefined();
  });

  it('should export middleware function', async () => {
    const mod = await import('@/middleware');
    expect(typeof mod.middleware).toBe('function');
  });

  it('should call updateSession with request', async () => {
    mockUpdateSession.mockResolvedValue(new Response(null, { status: 200 }));
    const mod = await import('@/middleware');
    const request = new Request('http://localhost/dashboard');
    await mod.middleware(request);
    expect(mockUpdateSession).toHaveBeenCalledWith(request);
  });
});
