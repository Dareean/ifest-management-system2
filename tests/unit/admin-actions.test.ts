import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });
const mockAdminAuth = { createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null }), getUserById: vi.fn() };

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom, auth: { admin: mockAdminAuth } }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

function chain(data: any = null) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'upsert'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

function adminChain() {
  return chain({ id: 'a-1', role: { level: 100 } });
}

describe('Admin Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('createDivision', () => {
    it('should create division', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { createDivision } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('name', 'Div A'); fd.append('slug', 'a');
      expect(await createDivision(null, fd)).toEqual({ success: true });
    });
  });

  describe('deleteDivision', () => {
    it('should delete division', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { deleteDivision } = await import('@/lib/actions/admin');
      expect(await deleteDivision('div-1')).toEqual({ success: true });
    });
  });

  describe('deleteRole', () => {
    it('should delete role', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { deleteRole } = await import('@/lib/actions/admin');
      expect(await deleteRole('role-1')).toEqual({ success: true });
    });
  });

  describe('createAssignment', () => {
    it('should return error if fields empty', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { createAssignment } = await import('@/lib/actions/admin');
      const fd = new FormData();
      expect(await createAssignment(null, fd)).toEqual({ error: 'Semua field harus diisi' });
    });

    it('should create assignment', async () => {
      let committeeCalls = 0;
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') {
          committeeCalls++;
          return committeeCalls <= 1 ? adminChain() : chain(null);
        }
        if (t === 'profiles') return chain(null);
        return chain(null);
      });
      const { createAssignment } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('division_id', 'div-1'); fd.append('role_id', 'role-1');
      fd.append('full_name', 'Test User'); fd.append('nim', '123'); fd.append('email', 'test@test.com');
      expect(await createAssignment(null, fd)).toEqual({ success: true });
    });
  });

  describe('updateDivision', () => {
    it('should update division', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { updateDivision } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('id', 'div-1'); fd.append('name', 'Div A'); fd.append('slug', 'a');
      expect(await updateDivision(null, fd)).toEqual({ success: true });
    });
  });

  describe('createRole', () => {
    it('should create role', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { createRole } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('name', 'Ketua'); fd.append('slug', 'ketua');
      fd.append('level', '100');
      expect(await createRole(null, fd)).toEqual({ success: true });
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { updateRole } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('id', 'role-1'); fd.append('name', 'Wakil');
      fd.append('slug', 'wakil'); fd.append('level', '80');
      expect(await updateRole(null, fd)).toEqual({ success: true });
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        return chain(null);
      });
      const { deleteAssignment } = await import('@/lib/actions/admin');
      expect(await deleteAssignment('assign-1')).toEqual({ success: true });
    });
  });

  describe('createYear', () => {
    it('should create year', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        if (t === 'committee_years') return chain({ id: 'year-1' });
        return chain(null);
      });
      const { createYear } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('label', '2026/2027');
      fd.append('started_at', '2026-07-01'); fd.append('ended_at', '2027-06-30');
      expect(await createYear(null, fd)).toEqual({ success: true });
    });

    it('should create year with copyFrom', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return adminChain();
        if (t === 'committee_years') return chain({ id: 'year-2' });
        if (t === 'divisions') return chain([{ id: 'd-1', name: 'Div A', slug: 'div-a', description: null, sort_order: 0 }]);
        if (t === 'roles') return chain([{ id: 'r-1', name: 'Ketua', slug: 'ketua', level: 100, is_approver: true, is_meeting_creator: true }]);
        return chain(null);
      });
      const { createYear } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('label', '2027/2028');
      fd.append('started_at', '2027-07-01'); fd.append('copy_from', 'year-1');
      expect(await createYear(null, fd)).toEqual({ success: true });
    });
  });

  describe('createAssignment with existing profile', () => {
    it('should create assignment when profile already exists', async () => {
      let committeeCalls = 0;
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') {
          committeeCalls++;
          return committeeCalls <= 1 ? adminChain() : chain(null);
        }
        if (t === 'profiles') return chain({ id: 'existing-user', full_name: 'Existing User' });
        return chain(null);
      });
      const { createAssignment } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('division_id', 'div-1'); fd.append('role_id', 'role-1');
      fd.append('full_name', 'Existing User'); fd.append('nim', '999'); fd.append('email', 'existing@test.com');
      expect(await createAssignment(null, fd)).toEqual({ success: true });
    });

    it('should return error when createUser fails', async () => {
      mockAdminAuth.createUser.mockResolvedValue({ data: null, error: { message: 'Email already registered' } });
      let committeeCalls = 0;
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') {
          committeeCalls++;
          return committeeCalls <= 1 ? adminChain() : chain(null);
        }
        if (t === 'profiles') return chain(null);
        return chain(null);
      });
      const { createAssignment } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('division_id', 'div-1'); fd.append('role_id', 'role-1');
      fd.append('full_name', 'New User'); fd.append('nim', '555'); fd.append('email', 'new@test.com');
      expect(await createAssignment(null, fd)).toEqual({ error: 'Email already registered' });
    });

    it('should return error when user already has assignment', async () => {
      let committeeCalls = 0;
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') {
          committeeCalls++;
          if (committeeCalls === 1) return adminChain();
          return chain({ id: 'existing-assign' });
        }
        if (t === 'profiles') return chain({ id: 'existing-user', full_name: 'Existing User' });
        return chain(null);
      });
      const { createAssignment } = await import('@/lib/actions/admin');
      const fd = new FormData(); fd.append('division_id', 'div-1'); fd.append('role_id', 'role-1');
      fd.append('full_name', 'Existing User'); fd.append('nim', '999'); fd.append('email', 'test@test.com');
      expect(await createAssignment(null, fd)).toEqual({ error: 'User sudah memiliki assignment di tahun ini' });
    });
  });
});
