# Testing Documentation

## Overview

This project uses a **Hybrid Testing Approach** combining:
- **Unit Tests** - Isolated function testing with mocks
- **Integration Tests** - API + Database interactions
- **E2E Tests** - Full user journey testing with browser automation

## Test Frameworks

| Framework | Purpose |
|-----------|---------|
| **Vitest** | Unit & Integration testing (fast, modern) |
| **Playwright** | E2E testing (browser automation) |
| **Testing Library** | React component testing utilities |

## Setup

### 1. Install Dependencies

```bash
npm install -D playwright @playwright/test vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

### 2. Configure Test Environment

Copy `.env.test.example` to `.env.test` and fill in your test database credentials:

```bash
cp .env.test.example .env.test
```

**IMPORTANT:** Use a **SEPARATE test database** - do NOT use production credentials!

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

## Running Tests

### All Tests

```bash
npm run test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### E2E Tests Only

```bash
npm run test:e2e
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### UI Mode

```bash
npm run test:ui
```

## Test Structure

```
tests/
├── unit/              # Unit tests (isolated functions)
│   └── email.test.ts  # Email utility tests
├── integration/       # Integration tests (DB + API)
│   └── letter-workflow.test.ts
└── e2e/               # End-to-end tests (browser)
    ├── auth.spec.ts
    ├── letters.spec.ts
    └── meetings.spec.ts
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/brevo', () => ({
  sendEmail: vi.fn(),
}));

describe('Email Function', () => {
  it('should send email correctly', async () => {
    // Test implementation
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, TEST_ACCOUNTS } from '../utils/test-helpers';

test('should login successfully', async ({ page }) => {
  await loginAs(page, 'member');
  await expect(page).toHaveURL('/dashboard');
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `dev` branches
- Pull requests to `main` or `dev` branches

See `.github/workflows/test.yml` for details.

## Dummy Test Accounts

Pre-created accounts for testing (in test database):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.ifest.local` | `TestAdmin123!` |
| Sekretaris | `sekretaris@test.ifest.local` | `TestSekretaris123!` |
| Member | `member@test.ifest.local` | `TestMember123!` |

## Coverage

Run with coverage report:

```bash
npm run test:unit -- --coverage
npm run test:integration -- --coverage
```

Coverage is automatically uploaded to Codecov in CI/CD.
