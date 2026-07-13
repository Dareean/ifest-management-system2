import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });
const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom, auth: { admin: { updateUserById: mockUpdateUser } } }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser, updateUser: vi.fn().mockResolvedValue({ error: null }) } }),
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

describe('Profile Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('updateProfile', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { updateProfile } = await import('@/lib/actions/profile');
      const fd = new FormData(); fd.append('fullName', 'New Name');
      expect(await updateProfile(null, fd)).toEqual({ error: 'Silakan login terlebih dahulu' });
    });

    it('should update profile', async () => {
      const { updateProfile } = await import('@/lib/actions/profile');
      const fd = new FormData(); fd.append('fullName', 'Updated Name');
      expect(await updateProfile(null, fd)).toEqual({ success: true });
    });
  });

  describe('changePassword', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { changePassword } = await import('@/lib/actions/profile');
      expect(await changePassword(null, new FormData())).toEqual({ error: 'Silakan login terlebih dahulu' });
    });

    it('should change password', async () => {
      const { changePassword } = await import('@/lib/actions/profile');
      const fd = new FormData();
      fd.append('password', 'newpass123');
      fd.append('confirmPassword', 'newpass123');
      expect(await changePassword(null, fd)).toEqual({ success: true });
    });
  });
});
