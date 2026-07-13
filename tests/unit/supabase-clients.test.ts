import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateServerClient = vi.fn(() => ({ auth: { getUser: vi.fn() }, from: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
  createBrowserClient: vi.fn(() => ({ auth: { getUser: vi.fn() }, from: vi.fn() })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { admin: { createUser: vi.fn(), getUserById: vi.fn(), deleteUser: vi.fn(), listUsers: vi.fn() } },
  })),
}));

const mockCookieStore = { get: vi.fn(), getAll: vi.fn().mockReturnValue([]), set: vi.fn() };
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

describe('Supabase Clients', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('createAdminClient', () => {
    it('should create admin client', async () => {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const client = createAdminClient();
      expect(client.from).toBeDefined();
      expect(client.auth.admin).toBeDefined();
    });
  });

  describe('createClient (server)', () => {
    it('should create server client', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();
      expect(client).toBeDefined();
      expect(mockCreateServerClient).toHaveBeenCalled();
    });

    it('should pass cookies getAll to createServerClient', async () => {
      mockCookieStore.getAll.mockReturnValue([{ name: 'test', value: 'val' }]);
      const { createClient } = await import('@/lib/supabase/server');
      await createClient();
      const callOpts = mockCreateServerClient.mock.calls[0][2];
      const result = callOpts.cookies.getAll();
      expect(result).toEqual([{ name: 'test', value: 'val' }]);
    });
  });
});
