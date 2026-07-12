import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit Tests for KPI Data Layer
 */

function createMockSupabase(resolvedData: any = { data: null, error: null }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'single', 'order', 'insert', 'update', 'delete', 'in', 'maybeSingle', 'limit', 'gte', 'not', 'like', 'count', 'head'];
  methods.forEach(method => { chain[method] = vi.fn(() => chain); });
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

describe('KPI Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue(createMockSupabase({ data: null, error: null }));
  });

  it('should return empty array when no KPIs found', async () => {
    const { getAllKpisWithTasks } = await import('@/lib/data/kpi');
    const result = await getAllKpisWithTasks();
    expect(result).toEqual([]);
  });

  it('should return empty array when no divisions found', async () => {
    const { getDivisionKpiSummaries } = await import('@/lib/data/kpi');
    const result = await getDivisionKpiSummaries();
    expect(result).toEqual([]);
  });
});
