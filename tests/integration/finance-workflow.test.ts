import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Integration Tests for Finance Workflow
 *
 * Tests budget management and transactions with real test database
 */

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
let testBudgetIds: string[] = [];
let testTransactionIds: string[] = [];
let testRequestIds: string[] = [];

describe('Finance Workflow Integration', () => {
  const supabase = createAdminClient();

  beforeEach(async () => {
    testBudgetIds = [];
    testTransactionIds = [];
    testRequestIds = [];
  });

  afterEach(async () => {
    if (testTransactionIds.length > 0) {
      await supabase.from('budget_transactions').delete().in('id', testTransactionIds);
    }
    if (testRequestIds.length > 0) {
      await supabase.from('budget_requests').delete().in('id', testRequestIds);
    }
    if (testBudgetIds.length > 0) {
      await supabase.from('budgets').delete().in('id', testBudgetIds);
    }
  });

  it('should create budget for division', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    expect(division).toBeTruthy();

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        total_budget: 5000000,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(budget).toBeTruthy();
    expect(budget!.total_budget).toBe('5000000');

    testBudgetIds.push(budget!.id);
  });

  it('should create budget request', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    expect(assignment).toBeTruthy();

    const { data: request, error } = await supabase
      .from('budget_requests')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        requester_id: assignment!.id,
        amount: 1000000,
        purpose: 'Test budget request for integration test',
        status: 'pending',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(request).toBeTruthy();
    expect(request!.status).toBe('pending');

    testRequestIds.push(request!.id);
  });

  it('should approve budget request', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: handler } = await supabase
      .from('committee_assignments')
      .select('id, role:roles!inner(is_approver)')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: request } = await supabase
      .from('budget_requests')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        requester_id: assignment!.id,
        amount: 500000,
        purpose: 'Test approval',
        status: 'pending',
      })
      .select()
      .single();

    testRequestIds.push(request!.id);

    const { error } = await supabase
      .from('budget_requests')
      .update({
        status: 'approved',
        handler_id: handler!.id,
        handled_at: new Date().toISOString(),
        notes: 'Approved for testing',
      })
      .eq('id', request!.id);

    expect(error).toBeNull();

    const { data: approved } = await supabase
      .from('budget_requests')
      .select('status')
      .eq('id', request!.id)
      .single();

    expect(approved!.status).toBe('approved');
  });

  it('should add expense transaction', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: budget } = await supabase
      .from('budgets')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        total_budget: 3000000,
      })
      .select()
      .single();

    testBudgetIds.push(budget!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: transaction, error } = await supabase
      .from('budget_transactions')
      .insert({
        budget_id: budget!.id,
        type: 'expense',
        amount: 500000,
        description: 'Test expense transaction',
        category: 'Supplies',
        transaction_date: '2026-07-10',
        created_by: assignment!.id,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(transaction).toBeTruthy();
    expect(transaction!.type).toBe('expense');

    testTransactionIds.push(transaction!.id);
  });

  it('should add income transaction', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: budget } = await supabase
      .from('budgets')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        total_budget: 2000000,
      })
      .select()
      .single();

    testBudgetIds.push(budget!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: transaction, error } = await supabase
      .from('budget_transactions')
      .insert({
        budget_id: budget!.id,
        type: 'income',
        amount: 1000000,
        description: 'Test income transaction',
        category: 'Sponsorship',
        transaction_date: '2026-07-05',
        created_by: assignment!.id,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(transaction).toBeTruthy();
    expect(transaction!.type).toBe('income');

    testTransactionIds.push(transaction!.id);
  });

  it('should calculate budget usage correctly', async () => {
    const { data: division } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .limit(1)
      .single();

    const { data: budget } = await supabase
      .from('budgets')
      .insert({
        committee_year_id: YEAR_ID,
        division_id: division!.id,
        total_budget: 5000000,
      })
      .select()
      .single();

    testBudgetIds.push(budget!.id);

    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', division!.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    // Add expenses
    const expenses = [
      { amount: 1000000, description: 'Expense 1' },
      { amount: 500000, description: 'Expense 2' },
      { amount: 300000, description: 'Expense 3' },
    ];

    for (const exp of expenses) {
      const { data: tx } = await supabase
        .from('budget_transactions')
        .insert({
          budget_id: budget!.id,
          type: 'expense',
          amount: exp.amount,
          description: exp.description,
          transaction_date: '2026-07-10',
          created_by: assignment!.id,
        })
        .select()
        .single();
      testTransactionIds.push(tx!.id);
    }

    // Get all transactions
    const { data: transactions } = await supabase
      .from('budget_transactions')
      .select('amount, type')
      .eq('budget_id', budget!.id);

    const totalUsed = transactions!
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    expect(totalUsed).toBe(1800000); // 1M + 500K + 300K
    expect(5000000 - totalUsed).toBe(3200000); // Remaining
  });
});
