# Contributing to Multiscreen Orchestrator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 8+
- Docker (for local databases)
- Figma desktop app (for plugin development)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/orchestrator.git
   cd orchestrator
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Start local services:
   ```bash
   docker-compose up -d
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code (protected)
- `develop` - Integration branch (protected)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Branch

```bash
# For a new feature
git checkout -b feature/add-rule-editor

# For a bug fix
git checkout -b fix/session-expiry-bug

# For documentation
git checkout -b docs/update-api-spec
```

## Pull Request Process

1. **Create a branch** from `develop`
2. **Make your changes** with appropriate tests
3. **Run checks locally**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

4. **Commit your changes** following [commit guidelines](#commit-message-guidelines)
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** to `develop` (not `main`)
7. **Fill out the PR template** completely
8. **Wait for review** - at least 1 approval required
9. **Address feedback** if requested
10. **Squash and merge** once approved

### PR Requirements

- ✅ All CI checks pass (lint, type check, tests, build)
- ✅ Code review approval from at least 1 maintainer
- ✅ No merge conflicts with target branch
- ✅ Appropriate tests added/updated
- ✅ Documentation updated if needed

## Coding Standards

### TypeScript

- Use **strict mode** (`strict: true`)
- Avoid `any` - use `unknown` if type is truly unknown
- Provide explicit return types for functions
- Use descriptive variable and function names

**Good:**
```typescript
function calculateSessionExpiry(createdAt: Date): Date {
  return new Date(createdAt.getTime() + 30 * 60 * 1000);
}
```

**Bad:**
```typescript
function calc(d: any) {
  return new Date(d.getTime() + 1800000);
}
```

### React

- Use **functional components** with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose
- Use **TypeScript** for prop types (no PropTypes)

**Good:**
```typescript
interface RuleCardProps {
  rule: Rule;
  onEdit: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
}

export function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  return (
    <div className="rule-card">
      <h3>{rule.name}</h3>
      {/* ... */}
    </div>
  );
}
```

### File Organization

- One component per file
- Co-locate tests with source files (`component.test.tsx`)
- Use index files for clean exports
- Group related files in directories

```
src/
├── components/
│   ├── RuleEditor/
│   │   ├── RuleEditor.tsx
│   │   ├── RuleEditor.test.tsx
│   │   ├── RuleList.tsx
│   │   ├── RuleCard.tsx
│   │   └── index.ts
│   └── ...
```

### Naming Conventions

- **Files:** PascalCase for components, camelCase for utilities
  - `RuleEditor.tsx`, `useRules.ts`, `formatDate.ts`
- **Components:** PascalCase
  - `RuleEditor`, `SessionManager`
- **Functions/Variables:** camelCase
  - `getUserId()`, `isSessionValid`
- **Constants:** UPPER_SNAKE_CASE
  - `MAX_PLAYERS`, `DEFAULT_TIMEOUT`
- **Types/Interfaces:** PascalCase
  - `PrototypeConfig`, `SessionState`

## Testing Guidelines

### Unit Tests

- Test individual functions and components
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

```typescript
describe('validateConfig', () => {
  it('should return success for valid config', () => {
    // Arrange
    const config = createMockConfig();

    // Act
    const result = validateConfig(config);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should return error for missing fileKey', () => {
    const config = { ...createMockConfig(), fileKey: '' };
    const result = validateConfig(config);
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

- Test API endpoints and database interactions
- Use test databases (not production)
- Clean up after each test

### E2E Tests

- Test complete user flows
- Use realistic test data
- Run against staging environment

### Coverage Targets

- Aim for **>80% code coverage**
- Focus on critical paths and edge cases
- Don't test for coverage sake - test for correctness

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)
- `perf`: Performance improvements

### Scopes

- `plugin`: Figma plugin
- `web`: Web orchestrator
- `backend`: Backend service
- `shared`: Shared packages
- `ci`: CI/CD changes
- `deps`: Dependency updates

### Examples

```
feat(plugin): add rule editor UI with natural language preview

Implemented the rule editor modal with WHEN/WHERE/DO sections.
Includes live preview of rules in natural language format.

Closes #42
```

```
fix(backend): resolve session expiry race condition

Sessions were expiring prematurely due to incorrect TTL calculation
in Redis. Now using consistent timestamp comparison.

Fixes #87
```

```
docs: update API specification with WebSocket events

Added documentation for all client-server WebSocket events
and Figma Embed API integration patterns.
```

### Commit Message Rules

- Use **imperative mood** ("add feature" not "added feature")
- Keep subject line under 72 characters
- Capitalize subject line
- Don't end subject line with period
- Separate subject from body with blank line
- Wrap body at 72 characters
- Reference issues in footer

## Questions?

If you have questions, please:

1. Check existing [Issues](https://github.com/your-org/orchestrator/issues)
2. Review [Documentation](./docs/)
3. Start a [Discussion](https://github.com/your-org/orchestrator/discussions)
4. Contact the maintainers

Thank you for contributing! 🎉
