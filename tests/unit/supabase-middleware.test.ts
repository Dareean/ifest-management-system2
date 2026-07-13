import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockSetCookie = vi.fn();
const mockNextResponseNext = vi.fn(() => ({
  cookies: { set: mockSetCookie },
}));
const mockNextResponseRedirect = vi.fn(() => new Response(null, { status: 307 }));

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNextResponseNext,
    redirect: mockNextResponseRedirect,
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

describe('Supabase Middleware (updateSession)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  function createRequest(pathname: string) {
    return {
      nextUrl: { pathname, clone: () => ({ pathname }) },
      cookies: { getAll: vi.fn().mockReturnValue([]), set: vi.fn() },
    } as any;
  }

  it('should redirect to /login for protected route when no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import('@/lib/supabase/middleware');
    await updateSession(createRequest('/dashboard'));
    expect(mockNextResponseRedirect).toHaveBeenCalled();
  });

  it('should redirect to /dashboard for /login when user exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } });
    const { updateSession } = await import('@/lib/supabase/middleware');
    await updateSession(createRequest('/login'));
    expect(mockNextResponseRedirect).toHaveBeenCalled();
  });

  it('should allow access to protected route when user exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } });
    mockNextResponseNext.mockReturnValue({ cookies: { set: mockSetCookie } });
    const { updateSession } = await import('@/lib/supabase/middleware');
    const result = await updateSession(createRequest('/dashboard'));
    expect(result).toBeDefined();
  });

  it('should allow access to public routes without user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockNextResponseNext.mockReturnValue({ cookies: { set: mockSetCookie } });
    const { updateSession } = await import('@/lib/supabase/middleware');
    const result = await updateSession(createRequest('/public'));
    expect(result).toBeDefined();
  });
});
