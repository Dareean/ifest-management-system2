import { describe, it, expect, vi, beforeEach } from 'vitest';

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
}

const mockFrom = vi.fn();
let authMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: authMock } },
  }),
}));

describe('Finance Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(createMockSupabase({ data: null, error: null }));
    authMock.mockResolvedValue({ data: { user: { email: 'test@test.com' } }, error: null });
  });

  describe('getFinanceOverview', () => {
    it('should return empty overview when no budgets', async () => {
      const { getFinanceOverview } = await import('@/lib/data/finance');
      const result = await getFinanceOverview();
      expect(result).toEqual({ total_budget: 0, total_used: 0, total_remaining: 0, pending_requests: 0 });
    });

    it('should calculate overview with budgets, expenses, and pending requests', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'budgets') {
          return createMockSupabase({
            data: [
              { id: 'budget-1', total_budget: 5000000 },
              { id: 'budget-2', total_budget: 3000000 },
            ],
            error: null,
          });
        }
        if (table === 'budget_transactions') {
          return createMockSupabase({
            data: [
              { id: 'tx-1', type: 'expense', amount: 1000000 },
              { id: 'tx-2', type: 'expense', amount: 500000 },
              { id: 'tx-3', type: 'income', amount: 2000000 },
            ],
            error: null,
          });
        }
        if (table === 'budget_requests') {
          return createMockSupabase({ data: null, error: null, count: 2 });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getFinanceOverview } = await import('@/lib/data/finance');
      const result = await getFinanceOverview();
      expect(result.total_budget).toBe(8000000);
      expect(result.total_used).toBe(1500000);
      expect(result.total_remaining).toBe(6500000);
      expect(result.pending_requests).toBe(2);
    });

    it('should handle empty expenses array', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'budgets') {
          return createMockSupabase({
            data: [{ id: 'budget-1', total_budget: 10000000 }],
            error: null,
          });
        }
        if (table === 'budget_transactions') {
          return createMockSupabase({ data: [], error: null });
        }
        if (table === 'budget_requests') {
          return createMockSupabase({ data: null, error: null, count: 0 });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getFinanceOverview } = await import('@/lib/data/finance');
      const result = await getFinanceOverview();
      expect(result.total_budget).toBe(10000000);
      expect(result.total_used).toBe(0);
      expect(result.pending_requests).toBe(0);
    });
  });

  describe('getBudgets', () => {
    it('should return empty array when no divisions', async () => {
      const { getBudgets } = await import('@/lib/data/finance');
      const result = await getBudgets();
      expect(result).toEqual([]);
    });

    it('should return budgets with division data and usage', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'divisions') {
          return createMockSupabase({
            data: [
              { id: 'div-1', name: 'Divisi A', slug: 'divisi-a' },
              { id: 'div-2', name: 'Divisi B', slug: 'divisi-b' },
            ],
            error: null,
          });
        }
        if (table === 'budgets') {
          return createMockSupabase({
            data: { id: 'budget-1', total_budget: 5000000 },
            error: null,
          });
        }
        if (table === 'budget_transactions') {
          return createMockSupabase({
            data: [
              { amount: 1000000, type: 'expense' },
              { amount: 500000, type: 'expense' },
              { amount: 2000000, type: 'income' },
            ],
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getBudgets } = await import('@/lib/data/finance');
      const result = await getBudgets();
      expect(result).toHaveLength(2);
      expect(result[0].division_name).toBe('Divisi A');
      expect(result[0].total_budget).toBe(5000000);
      expect(result[0].used_amount).toBe(1500000);
      expect(result[0].remaining).toBe(3500000);
    });

    it('should handle divisions with no budget', async () => {
      let callCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'divisions') {
          return createMockSupabase({
            data: [{ id: 'div-1', name: 'Divisi A', slug: 'divisi-a' }],
            error: null,
          });
        }
        if (table === 'budgets') {
          callCount++;
          if (callCount === 1) return createMockSupabase({ data: null, error: null });
          return createMockSupabase({ data: null, error: null });
        }
        if (table === 'budget_transactions') {
          return createMockSupabase({ data: null, error: null });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getBudgets } = await import('@/lib/data/finance');
      const result = await getBudgets();
      expect(result[0].total_budget).toBe(0);
      expect(result[0].id).toBe('');
    });
  });

  describe('getBudgetDetail', () => {
    it('should return null budget for non-existent division', async () => {
      const { getBudgetDetail } = await import('@/lib/data/finance');
      const result = await getBudgetDetail('non-existent');
      expect(result.budget).toBeNull();
      expect(result.transactions).toEqual([]);
    });

    it('should return budget detail with transactions for existing division', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'divisions') {
          return createMockSupabase({
            data: { id: 'div-1', name: 'Divisi A', slug: 'divisi-a' },
            error: null,
          });
        }
        if (table === 'budgets') {
          return createMockSupabase({
            data: { id: 'budget-1', total_budget: 5000000 },
            error: null,
          });
        }
        if (table === 'budget_transactions') {
          return createMockSupabase({
            data: [
              { id: 'tx-1', type: 'expense', amount: 1000000, description: 'Test', category: 'Ops', transaction_date: '2026-07-10', created_by: 'assign-1', created_at: '2026-07-10T00:00:00Z' },
            ],
            error: null,
          });
        }
        if (table === 'committee_assignments') {
          return createMockSupabase({
            data: { user: { full_name: 'Test User' } },
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getBudgetDetail } = await import('@/lib/data/finance');
      const result = await getBudgetDetail('div-1');
      expect(result.budget).not.toBeNull();
      expect(result.budget!.division_name).toBe('Divisi A');
      expect(result.budget!.total_budget).toBe(5000000);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].created_by_name).toBe('Test User');
    });
  });

  describe('getBudgetRequests', () => {
    it('should return empty array when none found', async () => {
      const { getBudgetRequests } = await import('@/lib/data/finance');
      const result = await getBudgetRequests();
      expect(result).toEqual([]);
    });

    it('should return mapped budget requests', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'budget_requests') {
          return createMockSupabase({
            data: [
              {
                id: 'req-1',
                amount: 1000000,
                purpose: 'Test purpose',
                status: 'approved',
                handled_at: '2026-07-11T00:00:00Z',
                notes: 'Approved',
                created_at: '2026-07-10T00:00:00Z',
                division: { name: 'Divisi A' },
                requester: { user: { full_name: 'Requester A' } },
                handler: { user: { full_name: 'Handler A' } },
              },
            ],
            error: null,
          });
        }
        return createMockSupabase({ data: null, error: null });
      });

      const { getBudgetRequests } = await import('@/lib/data/finance');
      const result = await getBudgetRequests();
      expect(result).toHaveLength(1);
      expect(result[0].division_name).toBe('Divisi A');
      expect(result[0].requester_name).toBe('Requester A');
      expect(result[0].handler_name).toBe('Handler A');
      expect(result[0].status).toBe('approved');
    });
  });
});
