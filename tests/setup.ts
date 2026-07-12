import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key';
process.env.BREVO_API_KEY = process.env.TEST_BREVO_API_KEY || 'test-brevo-key';

// Global test utilities
global.testUtils = {
  // Mock Brevo API calls for unit tests
  mockBrevoAPI: () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messageId: 'test-message-id' }),
      } as Response)
    );
  },

  // Restore fetch after mocking
  restoreFetch: () => {
    if (vi.isMockFunction(global.fetch)) {
      (global.fetch as any).mockRestore();
    }
  },
};

declare global {
  var testUtils: {
    mockBrevoAPI: () => void;
    restoreFetch: () => void;
  };
}
