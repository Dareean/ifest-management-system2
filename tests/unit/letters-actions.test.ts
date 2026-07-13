import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });

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
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

describe('Letters Action (createLetter)', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  it('should return error if not logged in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    const { createLetter } = await import('@/lib/actions/letters');
    const fd = new FormData(); fd.append('letter_type', 'Surat'); fd.append('subject', 'Test');
    expect(await createLetter(null, fd)).toEqual({ error: 'Silakan login terlebih dahulu' });
  });

  it('should validate required fields', async () => {
    const { createLetter } = await import('@/lib/actions/letters');
    const fd = new FormData();
    expect(await createLetter(null, fd)).toEqual({ error: 'Nama surat, jenis surat, dan maksud surat harus diisi' });
  });

  it('should create letter successfully', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((t: string) => {
      callCount++;
      if (t === 'committee_assignments' && callCount <= 2) return chain({ id: 'a-1' });
      if (t === 'letter_requests') return chain({ id: 'l-1' });
      return chain(null);
    });
    const { createLetter } = await import('@/lib/actions/letters');
    const fd = new FormData();
    fd.append('letterType', 'Surat Permohonan');
    fd.append('subject', 'Permohonan Data');
    fd.append('body', 'Isi surat');
    expect(await createLetter(null, fd)).toEqual({ success: true });
  });
});
