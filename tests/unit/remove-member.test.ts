import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'admin-user' } } });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn(), getAll: vi.fn().mockReturnValue([]) }),
}));

function chain(data: any = null) {
  const c: any = {};
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'not'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

describe('Remove Member Action', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  it('should return error if not logged in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('assignment_id', 'assign-1');
    expect(await removeMember(null, fd)).toEqual({ error: 'Unauthorized' });
  });

  it('should return error if caller has no assignment', async () => {
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('assignment_id', 'assign-1');
    const result = await removeMember(null, fd);
    expect(result).toEqual({ error: 'Anda tidak terdaftar sebagai panitia aktif.' });
  });

  it('should return error if caller level < 55', async () => {
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 50 } });
      return chain(null);
    });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('target_id', 'target-1');
    expect(await removeMember(null, fd)).toEqual({ error: 'Anda tidak memiliki izin untuk menghapus anggota.' });
  });

  it('should return error if target not found', async () => {
    let committeeCalls = 0;
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') {
        committeeCalls++;
        return committeeCalls === 1 ? chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } }) : chain(null);
      }
      return chain(null);
    });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('target_id', 'target-1');
    expect(await removeMember(null, fd)).toEqual({ error: 'Anggota tidak ditemukan.' });
  });

  it('should remove member successfully (BPH level >= 75)', async () => {
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 100 } });
      return chain(null);
    });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('target_id', 'target-1');
    expect(await removeMember(null, fd)).toEqual({ success: true });
  });

  it('should block cross-division removal for non-BPH', async () => {
    let committeeCalls = 0;
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') {
        committeeCalls++;
        if (committeeCalls === 1) return chain({ id: 'a-1', division_id: 'd-1', role: { level: 60 } });
        return chain({ id: 'target-1', division_id: 'd-2', role: { level: 50 } });
      }
      return chain(null);
    });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('target_id', 'target-1');
    expect(await removeMember(null, fd)).toEqual({ error: 'Anda hanya dapat menghapus anggota di divisi sendiri.' });
  });

  it('should block self-removal', async () => {
    let committeeCalls = 0;
    mockFrom.mockImplementation((t: string) => {
      if (t === 'committee_assignments') {
        committeeCalls++;
        if (committeeCalls === 1) return chain({ id: 'a-1', division_id: 'd-1', role: { level: 75 } });
        return chain({ id: 'a-1', division_id: 'd-1', role: { level: 50 } });
      }
      return chain(null);
    });
    const { removeMember } = await import('@/lib/actions/remove-member');
    const fd = new FormData(); fd.append('target_id', 'a-1');
    expect(await removeMember(null, fd)).toEqual({ error: 'Anda tidak dapat menghapus diri sendiri.' });
  });
});
