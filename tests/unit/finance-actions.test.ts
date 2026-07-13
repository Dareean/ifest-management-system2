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
  ['select', 'eq', 'single', 'maybeSingle', 'order', 'insert', 'update', 'delete', 'in', 'limit', 'gte', 'upsert'].forEach(m => { c[m] = vi.fn(() => c); });
  c.then = (resolve: any) => resolve({ data, error: null });
  return c;
}

describe('Finance Actions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockFrom.mockReturnValue(chain(null)); });

  describe('setBudget', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { setBudget } = await import('@/lib/actions/finance');
      expect(await setBudget(null, new FormData())).toEqual({ error: 'Silakan login terlebih dahulu' });
    });

    it('should set budget', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1' });
        return chain(null);
      });
      const { setBudget } = await import('@/lib/actions/finance');
      const fd = new FormData(); fd.append('division_id', 'd-1'); fd.append('amount', '5000000');
      expect(await setBudget(null, fd)).toEqual({ success: true });
    });
  });

  describe('addTransaction', () => {
    it('should return error if not logged in', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });
      const { addTransaction } = await import('@/lib/actions/finance');
      expect(await addTransaction(null, new FormData())).toEqual({ error: 'Silakan login terlebih dahulu' });
    });

    it('should add transaction', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1' });
        return chain(null);
      });
      const { addTransaction } = await import('@/lib/actions/finance');
      const fd = new FormData(); fd.append('budget_id', 'b-1'); fd.append('type', 'expense');
      fd.append('amount', '500000'); fd.append('description', 'Test');
      expect(await addTransaction(null, fd)).toEqual({ success: true });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1' });
        return chain(null);
      });
      const { deleteTransaction } = await import('@/lib/actions/finance');
      expect(await deleteTransaction('tx-1')).toEqual({ success: true });
    });
  });

  describe('createBudgetRequest', () => {
    it('should create request', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1', division_id: 'd-1' });
        return chain(null);
      });
      const { createBudgetRequest } = await import('@/lib/actions/finance');
      const fd = new FormData(); fd.append('division_id', 'd-1'); fd.append('amount', '100000'); fd.append('purpose', 'Test');
      expect(await createBudgetRequest(null, fd)).toEqual({ success: true });
    });
  });

  describe('handleBudgetRequest', () => {
    it('should approve request', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'committee_assignments') return chain({ id: 'a-1' });
        return chain(null);
      });
      const { handleBudgetRequest } = await import('@/lib/actions/finance');
      expect(await handleBudgetRequest('req-1', 'approved', 'Approved')).toEqual({ success: true });
    });
  });

  describe('exportFinanceCSV', () => {
    it('should export CSV', async () => {
      mockFrom.mockImplementation((t: string) => {
        if (t === 'budgets') return chain([{ id: 'b-1', total_budget: 5000000, division: { name: 'Div A' } }]);
        if (t === 'budget_transactions') return chain([]);
        return chain(null);
      });
      const { exportFinanceCSV } = await import('@/lib/actions/finance');
      const csv = await exportFinanceCSV();
      expect(csv).toContain('Div A');
    });
  });
});
