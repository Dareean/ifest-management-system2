import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests for Finance Data Layer
 *
 * Tests finance data fetching functions with mocked Supabase
 */

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

describe('Finance Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle empty finance overview with no budgets', async () => {
    const { getFinanceOverview } = await import('@/lib/data/finance');

    // Simulate no budgets found
    const mockFrom = vi.fn().mockReturnThis();
    mockFrom.select = vi.fn().mockResolvedValue({ data: null, error: null });
    mockFrom.eq = vi.fn().mockReturnThis();
    mockFrom.in = vi.fn().mockReturnThis();
    mockFrom.count = vi.fn().mockReturnThis();
    mockFrom.head = vi.fn().mockReturnThis();

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: () => ({
        select: vi.fn().mockResolvedValue({ data: null, error: null }),
        eq: vi.fn().mockReturnThis(),
      }),
    });

    const result = await getFinanceOverview();
    expect(result.total_budget).toBe(0);
    expect(result.total_used).toBe(0);
    expect(result.total_remaining).toBe(0);
    expect(result.pending_requests).toBe(0);
  });

  it('should calculate total budget correctly', async () => {
    const { getFinanceOverview } = await import('@/lib/data/finance');

    const mockBudgets = [
      { id: 'budget-1', total_budget: '5000000' },
      { id: 'budget-2', total_budget: '3000000' },
    ];

    const mockTransactions = [
      { amount: '1000000', type: 'expense' },
      { amount: '500000', type: 'expense' },
    ];

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: vi.fn().mockImplementation((table) => {
        if (table === 'budgets') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBudgets, error: null }),
            eq: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'budget_transactions') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
            in: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'budget_requests') {
          return {
            select: vi.fn().mockResolvedValue({ count: 2, error: null }),
            eq: vi.fn().mockReturnThis(),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
        };
      }),
    });

    const result = await getFinanceOverview();
    expect(result.total_budget).toBe(8000000);
    expect(result.total_used).toBe(1500000);
    expect(result.total_remaining).toBe(6500000);
    expect(result.pending_requests).toBe(2);
  });

  it('should handle budget detail for specific division', async () => {
    const { getBudgetDetail } = await import('@/lib/data/finance');

    const mockDivision = { id: 'div-1', name: 'Test Division', slug: 'test' };
    const mockBudget = { id: 'budget-1', total_budget: '10000000' };
    const mockTransactions = [
      { id: 'tx-1', type: 'expense', amount: '2000000', description: 'Expense 1', category: 'Ops', transaction_date: '2026-01-01', created_by: 'assign-1' },
    ];

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: vi.fn().mockImplementation((table) => {
        if (table === 'divisions') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockDivision, error: null }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'budgets') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: mockBudget, error: null }),
          };
        }
        if (table === 'budget_transactions') {
          return {
            select: vi.fn().mockResolvedValue({ data: mockTransactions, error: null }),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'committee_assignments') {
          return {
            select: vi.fn().mockResolvedValue({ data: { user: { full_name: 'Test User' }, error: null } }),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { user: { full_name: 'Test User' } }, error: null }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnThis(),
        };
      }),
    });
  });

  it('should return budget requests with correct formatting', async () => {
    const { getBudgetRequests } = await import('@/lib/data/finance');

    const mockRequests: any[] = [];

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: mockRequests, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    });

    const result = await getBudgetRequests();
    expect(result).toEqual([]);
  });

  it('should get budget detail for non-existent division', async () => {
    const { getBudgetDetail } = await import('@/lib/data/finance');

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getBudgetDetail('non-existent-division');
    expect(result.budget).toBeNull();
    expect(result.transactions).toEqual([]);
  });

  it('should get budgets with division data', async () => {
    const { getBudgets } = await import('@/lib/data/finance');

    const mockAdmin = await import('@/lib/supabase/admin');
    (mockAdmin.createAdminClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: 'div-1', name: 'BPH', slug: 'bph' }, { id: 'div-2', name: 'Perkap', slug: 'perkap' }] }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await getBudgets();
    expect(result.length).toBe(2);
  });
});
