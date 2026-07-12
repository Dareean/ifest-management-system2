import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification, notifyDivision } from '@/lib/internal-notifications';

/**
 * Integration Tests for Letter Workflow
 *
 * Tests the complete letter workflow with real test database:
 * Create → Notification → Email Queue → Status Changes
 *
 * NOTE: These tests require a separate Supabase test project
 * Set TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, TEST_SUPABASE_SERVICE_KEY in .env.test
 */

const YEAR_ID = 'c2f2a48e-3e58-4559-aaa0-623a3825348b';
let testLetterIds: string[] = [];
let testNotificationIds: string[] = [];

describe('Letter Workflow Integration', () => {
  const supabase = createAdminClient();

  beforeEach(async () => {
    // Clean up any existing test data
    testLetterIds = [];
    testNotificationIds = [];
  });

  afterEach(async () => {
    // Cleanup test data after each test
    if (testLetterIds.length > 0) {
      await supabase
        .from('letter_requests')
        .delete()
        .in('id', testLetterIds);
    }

    if (testNotificationIds.length > 0) {
      await supabase
        .from('notifications')
        .delete()
        .in('id', testNotificationIds);
    }
  });

  it('should create letter request and insert to database', async () => {
    // Get a test committee assignment
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id, division_id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    expect(assignment).toBeTruthy();

    // Create letter request
    const { data: letter, error } = await supabase
      .from('letter_requests')
      .insert({
        committee_year_id: YEAR_ID,
        requester_id: assignment!.id,
        division_id: assignment!.division_id,
        letter_type: 'Surat Permohonan',
        subject: 'Test Letter Integration',
        body: 'Test letter body for integration testing',
        status: 'requested',
        priority: 'sedang',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(letter).toBeTruthy();
    expect(letter!.status).toBe('requested');

    testLetterIds.push(letter!.id);
  });

  it('should create notification when letter is created', async () => {
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    expect(assignment).toBeTruthy();

    // Create notification (no urgent email for this test)
    await createNotification(
      assignment!.id,
      'letter',
      'Test Letter Notification',
      'This is a test notification for letter workflow',
      false // not urgent, in-app only
    );

    // Verify notification was created
    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('committee_assignment_id', assignment!.id)
      .eq('type', 'letter')
      .eq('title', 'Test Letter Notification')
      .single();

    expect(notification).toBeTruthy();
    expect(notification!.body).toContain('test notification');

    testNotificationIds.push(notification!.id);
  });

  it('should update letter status from requested to processing', async () => {
    // Create a test letter first
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id, division_id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: letter } = await supabase
      .from('letter_requests')
      .insert({
        committee_year_id: YEAR_ID,
        requester_id: assignment!.id,
        division_id: assignment!.division_id,
        letter_type: 'Surat Permohonan',
        subject: 'Test Letter Status Update',
        body: 'Test letter body',
        status: 'requested',
        priority: 'sedang',
      })
      .select()
      .single();

    testLetterIds.push(letter!.id);

    // Update status to processing
    const { error: updateError } = await supabase
      .from('letter_requests')
      .update({ status: 'processing' })
      .eq('id', letter!.id);

    expect(updateError).toBeNull();

    // Verify status was updated
    const { data: updatedLetter } = await supabase
      .from('letter_requests')
      .select('status')
      .eq('id', letter!.id)
      .single();

    expect(updatedLetter!.status).toBe('processing');
  });

  it('should complete letter with final document URL', async () => {
    // Create a test letter in processing status
    const { data: assignment } = await supabase
      .from('committee_assignments')
      .select('id, division_id')
      .eq('committee_year_id', YEAR_ID)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: letter } = await supabase
      .from('letter_requests')
      .insert({
        committee_year_id: YEAR_ID,
        requester_id: assignment!.id,
        division_id: assignment!.division_id,
        letter_type: 'Surat Permohonan',
        subject: 'Test Letter Completion',
        body: 'Test letter body',
        status: 'processing',
        priority: 'sedang',
      })
      .select()
      .single();

    testLetterIds.push(letter!.id);

    const documentUrl = 'https://drive.google.com/test-document-id';

    // Complete letter
    const { error: completeError } = await supabase
      .from('letter_requests')
      .update({
        status: 'sent',
        final_document_url: documentUrl,
      })
      .eq('id', letter!.id);

    expect(completeError).toBeNull();

    // Verify completion
    const { data: completedLetter } = await supabase
      .from('letter_requests')
      .select('status, final_document_url')
      .eq('id', letter!.id)
      .single();

    expect(completedLetter!.status).toBe('sent');
    expect(completedLetter!.final_document_url).toBe(documentUrl);
  });

  it('should notify division when letter status changes', async () => {
    // Get BPH division
    const { data: bphDivision } = await supabase
      .from('divisions')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('slug', 'bph')
      .maybeSingle();

    if (!bphDivision) {
      console.warn('BPH division not found in test database, skipping test');
      return;
    }

    // Notify division (no urgent email for this test)
    await notifyDivision(
      bphDivision.id,
      'letter',
      'Test Division Notification',
      'Letter status has changed',
      false // not urgent, in-app only
    );

    // Verify notifications were created for division members
    const { data: divisionMembers } = await supabase
      .from('committee_assignments')
      .select('id')
      .eq('committee_year_id', YEAR_ID)
      .eq('division_id', bphDivision.id)
      .eq('is_active', true);

    expect(divisionMembers).toBeTruthy();
    expect(divisionMembers!.length).toBeGreaterThan(0);

    // Check notifications were created
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .in('committee_assignment_id', divisionMembers!.map(m => m.id))
      .eq('type', 'letter')
      .eq('title', 'Test Division Notification');

    expect(notifications).toBeTruthy();
    expect(notifications!.length).toBeGreaterThan(0);

    // Clean up
    testNotificationIds.push(...notifications!.map(n => n.id));
  });
});
