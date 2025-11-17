# Testing Guide

## Overview

This guide covers the testing strategy, conventions, and best practices for the Cavaleiros dos Elementos project.

## Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Assertions**: Vitest expect API
- **Mocking**: Vitest mock functions
- **Coverage**: Vitest coverage (c8)

## Project Structure

```
src/
├── components/
│   ├── __tests__/
│   │   └── ComponentName.test.tsx
│   └── ComponentName.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useHookName.test.tsx
│   └── useHookName.tsx
├── lib/
│   ├── __tests__/
│   │   └── utility.test.ts
│   └── utility.ts
└── test/
    ├── setup.ts
    └── mocks/
        ├── supabase.ts
        └── repositories.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test BattleCard.test.tsx

# Run tests in UI mode
npm run test:ui
```

## Test Types

### 1. Unit Tests

Test individual components, functions, or hooks in isolation.

**Example - Component Test**:
```typescript
// src/components/__tests__/BattleCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BattleCard from '../BattleCard';

describe('BattleCard', () => {
  it('renders card with knight name', () => {
    render(<BattleCard card={mockCard} />);
    expect(screen.getByText('Sir Hydrogen')).toBeInTheDocument();
  });
});
```

**Example - Utility Test**:
```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('merges classes correctly', () => {
    expect(cn('base', 'override')).toBe('base override');
  });
});
```

### 2. Integration Tests

Test how multiple components work together.

**Example**:
```typescript
// src/hooks/battle/__tests__/useBattleLogic.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBattleLogic } from '../useBattleLogic';

describe('useBattleLogic Integration', () => {
  it('complete battle flow works correctly', () => {
    const { result } = renderHook(() => useBattleLogic());
    
    act(() => {
      result.current.selectAttribute('atomic_number');
    });
    
    expect(result.current.battleState).toBe('comparing');
  });
});
```

### 3. Security Tests

Test security utilities and validation functions.

```typescript
// src/lib/__tests__/security.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeHTML, isValidEmail } from '../security';

describe('Security Utils', () => {
  it('prevents XSS attacks', () => {
    const malicious = '<script>alert("XSS")</script>';
    expect(sanitizeHTML(malicious)).not.toContain('<script>');
  });
});
```

## Testing Best Practices

### 1. Test File Naming
- Component tests: `ComponentName.test.tsx`
- Hook tests: `useHookName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Keep tests close to source files

### 2. Test Structure
Follow the AAA pattern:
- **Arrange**: Set up test data and state
- **Act**: Execute the code being tested
- **Assert**: Verify the results

```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = myFunction(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

### 3. Test Descriptions
- Use descriptive test names
- Follow convention: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

```typescript
describe('BattleCard', () => {
  describe('when card is super trump', () => {
    it('should display super trump badge', () => {
      // test implementation
    });
  });
});
```

### 4. Mocking

**Supabase Mock**:
```typescript
// src/test/mocks/supabase.ts
export const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
};
```

**Repository Mock**:
```typescript
import { createMockCardRepository } from '@/test/mocks/repositories';

const mockRepo = createMockCardRepository();
mockRepo.findById.mockResolvedValue(mockCard);
```

### 5. Accessibility Testing
Test keyboard navigation and screen reader support:

```typescript
it('should be keyboard accessible', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button');
  
  button.focus();
  expect(button).toHaveFocus();
});
```

## Coverage Goals

### Current Coverage
- Utilities: 90%+ coverage required
- Components: 80%+ coverage target
- Hooks: 85%+ coverage target
- Overall: 80%+ coverage goal

### Priority Testing Areas
1. ✅ Battle logic and mechanics
2. ✅ Security utilities
3. ✅ Authentication flow
4. ⚠️ Achievement system (partial)
5. ⚠️ Ranking calculations (partial)
6. ❌ Pack opening (needs tests)
7. ❌ Daily challenges (needs tests)

## Test Scenarios by Feature

### Battle System
- [x] Card comparison logic
- [x] Super trump mechanics
- [x] Attribute selection
- [x] Win/loss calculation
- [x] Card transfer
- [ ] Battle timeout
- [ ] Network errors

### Authentication
- [x] Google OAuth flow
- [x] Session persistence
- [x] Protected routes
- [x] Sign out
- [ ] Session expiry

### Card Collection
- [x] Card display
- [x] Filtering
- [x] Sorting
- [ ] Search functionality
- [ ] Pagination

### Achievements
- [x] Progress tracking
- [x] Completion detection
- [x] Reward claiming
- [ ] XP calculation
- [ ] Level progression

## Common Testing Patterns

### Testing Async Operations
```typescript
it('loads data on mount', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```typescript
import { fireEvent } from '@testing-library/react';

it('handles button click', () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### Testing Forms
```typescript
it('submits form with valid data', async () => {
  const onSubmit = vi.fn();
  render(<Form onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
});
```

### Testing Error States
```typescript
it('displays error message on failure', async () => {
  mockApi.get.mockRejectedValue(new Error('Failed'));
  
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## CI/CD Integration

### Pre-commit Hook
Tests run automatically before commits via Husky:

```json
// .husky/pre-commit
npm test
```

### Pre-push Hook
Full test suite with coverage:

```json
// .husky/pre-push
npm run test:coverage
```

## Debugging Tests

### Debug Output
```typescript
import { screen, debug } from '@testing-library/react';

it('debug example', () => {
  render(<MyComponent />);
  debug(); // Prints DOM to console
});
```

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

## Test Maintenance

### Regular Updates
- Run tests before every commit
- Update snapshots when UI changes
- Review test coverage weekly
- Refactor flaky tests immediately

### Test Quality Checklist
- [ ] Tests are deterministic (no random failures)
- [ ] Tests are fast (<100ms each)
- [ ] Tests are isolated (no dependencies)
- [ ] Tests are readable and well-documented
- [ ] Mocks are realistic
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

## Future Enhancements

1. **E2E Tests**: Add Playwright for end-to-end testing
2. **Visual Regression**: Implement screenshot testing
3. **Performance Tests**: Add metrics tracking
4. **Load Tests**: Test with large datasets
5. **A11y Tests**: Automated accessibility audits

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2024-11-17
