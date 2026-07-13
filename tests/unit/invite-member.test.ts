import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

const mockFrom = vi.fn();
const mockCreateUser = vi.fn();
const mockListUsers = vi.fn();
const mockGetUserById = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'current-user' } } });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { createUser: mockCreateUser, getUserById: mockGetUserById, listUsers: mockListUsers } },
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

function chain(data: any = null) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'upsert'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

describe('Invite Member Action', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  it('should return error if not logged in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 0 } });
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    expect(await inviteMember(null, new FormData())).toEqual({ error: 'Anda tidak memiliki izin untuk mengundang anggota.' });
  });

  it('should return error if caller level < 55', async () => {
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 50 } });
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    expect(await inviteMember(null, new FormData())).toEqual({ error: 'Anda tidak memiliki izin untuk mengundang anggota.' });
  });

  it('should validate required fields', async () => {
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } });
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    const fd = new FormData(); fd.append('full_name', 'Test');
    expect(await inviteMember(null, fd)).toEqual({ error: 'Semua field harus diisi.' });
  });

  it('should validate target role level', async () => {
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } });
      if (t === 'roles') return chain({ level: 100 });
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    const fd = new FormData(); fd.append('full_name', 'Test'); fd.append('nim', '123'); fd.append('email', 'test@test.com'); fd.append('role_id', 'r-1');
    expect(await inviteMember(null, fd)).toEqual({ error: 'Role yang dipilih tidak valid untuk level Anda.' });
  });

  it('should invite new user successfully', async () => {
    let committeeCalls = 0;
    mockGetUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } } });
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null });
    mockListUsers.mockResolvedValue({ data: { users: [] } });
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') {
        committeeCalls++;
        if (committeeCalls === 1) return chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } });
        return chain(null);
      }
      if (t === 'roles') return chain({ level: 50 });
      if (t === 'profiles') return chain(null);
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    const fd = new FormData(); fd.append('full_name', 'New Member');
    fd.append('nim', '123456'); fd.append('email', 'new@test.com'); fd.append('role_id', 'r-2');
    expect(await inviteMember(null, fd)).toEqual({ success: true });
  });

  it('should detect duplicate NIM with different email', async () => {
    mockGetUserById.mockResolvedValue({ data: { user: { email: 'existing@test.com' } } });
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } });
      if (t === 'roles') return chain({ level: 50 });
      if (t === 'profiles') return chain({ id: 'existing-profile' });
      return chain(null);
    });
    const { inviteMember } = await import('@/lib/actions/invite-member');
    const fd = new FormData(); fd.append('full_name', 'Test');
    fd.append('nim', '123456'); fd.append('email', 'different@test.com'); fd.append('role_id', 'r-2');
    expect(await inviteMember(null, fd)).toEqual({ error: expect.stringContaining('sudah terdaftar dengan email yang berbeda') });
  });
});
