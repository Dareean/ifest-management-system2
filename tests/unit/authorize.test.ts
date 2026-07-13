import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(data: any = null) {
  const chain: any = {};
  ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit'].forEach(m => { chain[m] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve({ data, error: null });
  return chain;
}

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

describe('Authorize', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(createMockSupabase(null)); });

  describe('requireRole', () => {
    it('should return not authorized when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { requireRole } = await import('@/lib/auth/authorize');
      const result = await requireRole(75);
      expect(result.authorized).toBe(false);
    });
    it('should return authorized if level sufficient', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Ketua', slug: 'ketua', level: 100, is_approver: true, is_meeting_creator: true },
        });
        return createMockSupabase(null);
      });
      const { requireRole } = await import('@/lib/auth/authorize');
      const result = await requireRole(75);
      expect(result.authorized).toBe(true);
      if (result.authorized) {
        expect(result.session.roleLevel).toBe(100);
      }
    });

    it('should return error if level insufficient', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Anggota', slug: 'anggota', level: 50, is_approver: false, is_meeting_creator: false },
        });
        return createMockSupabase(null);
      });
      const { requireRole } = await import('@/lib/auth/authorize');
      const result = await requireRole(75);
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.error).toContain('Akses ditolak');
      }
    });
  });

  describe('requirePermission', () => {
    it('should return authorized if has permission', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Ketua', slug: 'ketua', level: 100, is_approver: true, is_meeting_creator: true },
        });
        return createMockSupabase(null);
      });
      const { requirePermission } = await import('@/lib/auth/authorize');
      const result = await requirePermission('is_approver');
      expect(result.authorized).toBe(true);
    });

    it('should return error if missing permission', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Anggota', slug: 'anggota', level: 50, is_approver: false, is_meeting_creator: false },
        });
        return createMockSupabase(null);
      });
      const { requirePermission } = await import('@/lib/auth/authorize');
      const result = await requirePermission('is_approver');
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.error).toContain('Akses ditolak');
      }
    });

    it('should check is_meeting_creator permission', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Ketua', slug: 'ketua', level: 100, is_approver: true, is_meeting_creator: true },
        });
        return createMockSupabase(null);
      });
      const { requirePermission } = await import('@/lib/auth/authorize');
      const result = await requirePermission('is_meeting_creator');
      expect(result.authorized).toBe(true);
    });

    it('should return error for missing is_meeting_creator', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Anggota', slug: 'anggota', level: 50, is_approver: false, is_meeting_creator: false },
        });
        return createMockSupabase(null);
      });
      const { requirePermission } = await import('@/lib/auth/authorize');
      const result = await requirePermission('is_meeting_creator');
      expect(result.authorized).toBe(false);
      if (!result.authorized) {
        expect(result.error).toContain('membuat rapat');
      }
    });
  });

  describe('requireSecretary', () => {
    it('should return authorized for secretary slugs', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Sekretaris 1', slug: 'sekretaris-1', level: 80, is_approver: false, is_meeting_creator: false },
        });
        return createMockSupabase(null);
      });
      const { requireSecretary } = await import('@/lib/auth/authorize');
      const result = await requireSecretary();
      expect(result.authorized).toBe(true);
    });

    it('should return error for non-secretary roles', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return createMockSupabase({
          id: 'a-1', division_id: 'd-1',
          division: { name: 'Div A' },
          role: { name: 'Anggota', slug: 'anggota', level: 50, is_approver: false, is_meeting_creator: false },
        });
        return createMockSupabase(null);
      });
      const { requireSecretary } = await import('@/lib/auth/authorize');
      const result = await requireSecretary();
      expect(result.authorized).toBe(false);
    });
  });
});
