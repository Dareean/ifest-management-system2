import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit Tests for Finance Data Layer
 */

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};

  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];

  methods.forEach(method => {
    chain[method] = vi.fn(() => chain);
  });

  // Make the chain thenable so it can be awaited
  chain.then = (resolve: any) => resolve(resolvedData);

  return chain;
}

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
    auth: { admin: { getUserById: vi.fn() } },
  }),
}));

describe('Finance Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(createMockSupabase({ data: null, error: null }));
  });

  it('should return empty finance overview when no budgets', async () => {
    const { getFinanceOverview } = await import('@/lib/data/finance');
    const result = await getFinanceOverview();
    expect(result.total_budget).toBe(0);
    expect(result.total_used).toBe(0);
    expect(result.pending_requests).toBe(0);
  });

  it('should return empty budget requests when none found', async () => {
    const { getBudgetRequests } = await import('@/lib/data/finance');
    const result = await getBudgetRequests();
    expect(result).toEqual([]);
  });

  it('should return null budget for non-existent division', async () => {
    const { getBudgetDetail } = await import('@/lib/data/finance');
    const result = await getBudgetDetail('non-existent');
    expect(result.budget).toBeNull();
    expect(result.transactions).toEqual([]);
  });

  it('should return empty array when no divisions have budgets', async () => {
    const { getBudgets } = await import('@/lib/data/finance');
    const result = await getBudgets();
    expect(result).toEqual([]);
  });
});
