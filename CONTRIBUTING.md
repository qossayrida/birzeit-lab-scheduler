# Contributing to Birzeit Lab Scheduler

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork locally

```bash
git clone https://github.com/YOUR_USERNAME/birzeit-lab-scheduler.git
cd birzeit-lab-scheduler
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a branch**

```bash
git checkout -b feature/your-feature-name
```

4. **Start development server**

```bash
npm run dev
```

## Development Workflow

### 1. Making Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript types properly

### 2. Testing

Before submitting:

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build to check for errors
npm run build
```

### 3. Commit Messages

Use clear, descriptive commit messages:

```
feat: add drag-and-drop for lab assignments
fix: resolve double-booking validation bug
docs: update README with new features
style: format code with prettier
refactor: simplify scheduler algorithm
test: add tests for PRNG determinism
```

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 4. Pull Request

1. Push your branch to your fork
2. Open a Pull Request on GitHub
3. Fill in the PR template
4. Link related issues
5. Wait for review

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Core logic and utilities
├── store/         # State management
├── types/         # TypeScript type definitions
└── App.tsx        # Main application

api/               # Serverless functions
tests/             # Test files
public/            # Static assets
```

## Coding Standards

### TypeScript

- Use explicit types, avoid `any`
- Define interfaces for data structures
- Use type guards for runtime checks
- Leverage union types and generics

```typescript
// Good
interface Lab {
  id: string;
  code: string;
  // ...
}

function processLab(lab: Lab): void {
  // ...
}

// Avoid
function processLab(lab: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export function Button({ onClick, label, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Derive computed values instead of storing
- Use proper TypeScript types for store

### Styling

- Use Tailwind CSS utility classes
- Follow existing design patterns
- Ensure responsive design
- Test on mobile devices

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `index.ts` in types folder
- Tests: `*.test.ts` or `*.test.tsx`

## Testing Guidelines

### Unit Tests

Test individual functions and utilities:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Component Tests

Test component behavior:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for >80% coverage
- Test edge cases
- Test error handling
- Test async operations

## Documentation

### Code Comments

```typescript
/**
 * Calculate score for TA assignment
 * @param ta - Teaching assistant
 * @param lab - Lab to assign
 * @param slot - Time slot
 * @returns Score value (higher is better)
 */
function calculateScore(ta: TA, lab: Lab, slot: Slot): number {
  // Implementation
}
```

### README Updates

When adding features:
- Update README.md
- Add usage examples
- Update feature list
- Add screenshots if UI changes

### API Documentation

Document public APIs and interfaces:

```typescript
/**
 * Main scheduling function
 * 
 * @param labs - Array of labs to schedule
 * @param tas - Array of available TAs
 * @param seed - Random seed for deterministic results
 * @param existingAssignments - Previously locked assignments
 * @returns Schedule result with assignments and unassigned labs
 * 
 * @example
 * ```typescript
 * const result = scheduleAssignments(labs, tas, 12345);
 * console.log(result.assignments);
 * ```
 */
export function scheduleAssignments(
  labs: Lab[],
  tas: TA[],
  seed: number,
  existingAssignments?: Assignment[]
): ScheduleResult {
  // Implementation
}
```

## Common Tasks

### Adding a New Component

1. Create component file in `src/components/`
2. Define prop types interface
3. Implement component
4. Add to exports if needed
5. Write tests
6. Update documentation

### Adding a New Feature

1. Create feature branch
2. Implement core logic in `src/lib/`
3. Add types to `src/types/`
4. Create UI components
5. Update store if needed
6. Write tests
7. Update README
8. Submit PR

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test passes
4. Add regression test
5. Submit PR with issue reference

### Improving Performance

1. Profile the application
2. Identify bottleneck
3. Implement optimization
4. Measure improvement
5. Document changes
6. Submit PR with benchmarks

## Review Process

### What Reviewers Look For

- Code quality and readability
- Test coverage
- Documentation
- Performance implications
- Breaking changes
- Security concerns

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Update PR description if scope changes
- Thank reviewers for their time

## Release Process

Maintainers handle releases:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production
5. Announce release

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue with use case description
- **Security**: Email maintainers privately

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vitest](https://vitest.dev)

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Birzeit Lab Scheduler! 🎉
