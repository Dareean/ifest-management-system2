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
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'not', 'upsert'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

describe('Tasks Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('createTask', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { createTask } = await import('@/lib/actions/tasks');
      expect(await createTask(null, new FormData())).toEqual({ error: 'Silakan login terlebih dahulu' });
    });

    it('should create task', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 60 } });
        return chain(null);
      });
      const { createTask } = await import('@/lib/actions/tasks');
      const fd = new FormData(); fd.append('kpi_item_id', 'kpi-1'); fd.append('division_id', 'd-1'); fd.append('title', 'Task 1');
      expect(await createTask(null, fd)).toEqual({ success: true });
    });
  });

  describe('completeTask', () => {
    it('should complete task', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 60 } });
        return chain(null);
      });
      const { completeTask } = await import('@/lib/actions/tasks');
      expect(await completeTask('task-1')).toEqual({ success: true });
    });
  });

  describe('reopenTask', () => {
    it('should reopen task', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 60 } });
        return chain(null);
      });
      const { reopenTask } = await import('@/lib/actions/tasks');
      expect(await reopenTask('task-1')).toEqual({ success: true });
    });
  });

  describe('deleteTask', () => {
    it('should delete task', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1', role: { level: 60 } });
        return chain(null);
      });
      const { deleteTask } = await import('@/lib/actions/tasks');
      expect(await deleteTask('task-1')).toEqual({ success: true });
    });
  });
});
