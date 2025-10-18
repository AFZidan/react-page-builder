# Contributing to React Page Builder

Thank you for your interest in contributing to React Page Builder! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together to improve the project
- **Be patient**: Remember that everyone is learning

## Getting Started

Before you start contributing, please:

1. **Fork the repository** on GitHub
2. **Star the repository** if you find it useful
3. **Read the documentation** to understand the project
4. **Check existing issues** to see if your idea or bug has been reported

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

### Initial Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/react-page-builder.git
   cd react-page-builder
   ```

2. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/AFZidan/react-page-builder.git
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Verify installation:**
   ```bash
   npm test      # Should pass all tests
   npm run lint  # Should pass linting
   npm run build # Should build successfully
   ```

### Project Structure

```
react-page-builder/
├── src/
│   ├── PageBuilder.jsx      # Main page builder component
│   ├── Renderer.jsx          # Component renderer
│   ├── index.jsx             # Package entry point
│   ├── components/           # Reusable components
│   │   ├── ContextMenu.jsx
│   │   ├── DynamicIcon.jsx
│   │   ├── EmbedHelper.jsx
│   │   ├── FormWithValidation.jsx
│   │   ├── IconPicker.jsx
│   │   └── StyleControls.jsx
│   ├── tests/                # Test files
│   │   ├── setup.js
│   │   ├── PageBuilder.test.jsx
│   │   ├── Renderer.test.jsx
│   │   └── components/
│   └── utils/                # Utility functions
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD workflows
├── package.json
├── vite.config.js
└── vitest.config.js
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-video-component`)
- `fix/` - Bug fixes (e.g., `fix/drag-drop-issue`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-renderer`)
- `test/` - Adding or updating tests (e.g., `test/add-icon-picker-tests`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Keep changes focused and atomic

### 3. Write Tests

All new features and bug fixes should include tests:

```bash
# Run tests in watch mode during development
npm run test:watch

# Run tests once
npm test

# Run tests with coverage
npm run test:coverage
```

**Test Requirements:**
- Unit tests for new functions/components
- Integration tests for feature workflows
- Maintain or improve code coverage
- All tests must pass before submitting PR

### 4. Update Documentation

If your changes affect usage:
- Update relevant documentation in `/docs`
- Add JSDoc comments to new functions
- Update README.md if necessary
- Add examples for new features

### 5. Run Quality Checks

Before committing, ensure all checks pass:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run tests
npm test

# Build the package
npm run build
```

## Testing

### Writing Tests

We use Vitest and React Testing Library. Place tests in `src/tests/`:

```jsx
// Example test file: src/tests/components/MyComponent.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage

We aim for high test coverage:
- Minimum 70% overall coverage
- 80%+ for critical components
- 90%+ for utility functions

Check coverage:
```bash
npm run test:coverage
open coverage/index.html  # View detailed coverage report
```

## Code Style

### ESLint Configuration

We use ESLint with React rules. The configuration is in `.eslintrc.json`.

**Key Guidelines:**
- Use functional components with hooks
- Avoid prop-types (we're moving to TypeScript in future)
- Use meaningful variable names
- Keep functions small and focused
- Limit unused variables (prefix with `_` if intentional)

### Code Formatting

```jsx
// ✅ Good
export default function MyComponent({ title, onSave }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
    onSave();
  };

  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={handleClick}>Save</button>
    </div>
  );
}

// ❌ Bad
export default function MyComponent(props) {
  const [isOpen,setIsOpen]=useState(false)
  return <div><h2>{props.title}</h2><button onClick={()=>{setIsOpen(true);props.onSave()}}>Save</button></div>
}
```

### React Best Practices

1. **Use descriptive component names**
   ```jsx
   // ✅ Good
   <IconPicker value={icon} onChange={setIcon} />
   
   // ❌ Bad
   <IP val={icon} chg={setIcon} />
   ```

2. **Extract complex logic into custom hooks**
   ```jsx
   // ✅ Good
   const { components, addComponent, updateComponent } = useComponents();
   
   // ❌ Bad - All logic in component
   ```

3. **Memoize expensive computations**
   ```jsx
   const sortedComponents = useMemo(
     () => components.sort((a, b) => a.order - b.order),
     [components]
   );
   ```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(renderer): add video component support"

# Bug fix
git commit -m "fix(drag-drop): prevent duplicate components on drop"

# Documentation
git commit -m "docs(contributing): add testing guidelines"

# Breaking change
git commit -m "feat(api): change component structure

BREAKING CHANGE: components now require 'type' field"
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ Linter passes (`npm run lint`)
3. ✅ Build succeeds (`npm run build`)
4. ✅ Documentation is updated
5. ✅ Commits follow convention
6. ✅ Branch is up to date with main

### Submitting a PR

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference related issues (e.g., "Fixes #123")
   - Describe what changes were made and why
   - Add screenshots for UI changes
   - List any breaking changes

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of the changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Related Issues
   Fixes #(issue number)
   
   ## Testing
   - [ ] Unit tests added/updated
   - [ ] All tests passing
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### PR Review Process

1. **Automated checks** will run (tests, linting, build)
2. **Maintainer review** - usually within 2-3 days
3. **Address feedback** - make requested changes
4. **Approval** - PR will be merged by maintainer
5. **Cleanup** - delete your branch after merge

### Getting Your PR Merged Faster

- ✅ Keep PRs small and focused
- ✅ Write clear commit messages
- ✅ Add tests for new features
- ✅ Respond promptly to feedback
- ✅ Resolve merge conflicts quickly

## Reporting Bugs

### Before Reporting

1. **Search existing issues** - your bug might be known
2. **Update to latest version** - bug might be fixed
3. **Check documentation** - might be expected behavior

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Package version: 1.0.1
- React version: 18.2.0
- Browser: Chrome 120
- OS: macOS 14.0

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

## Suggesting Features

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Examples, mockups, references
```

## Documentation

### Types of Documentation

1. **Code Comments**
   - Explain complex logic
   - Document parameters and return values
   - Use JSDoc for public APIs

2. **README.md**
   - Overview and quick start
   - Installation instructions
   - Basic usage examples

3. **docs/ Directory**
   - Detailed guides
   - API reference
   - Integration examples
   - Best practices

4. **CHANGELOG.md**
   - Keep updated with changes
   - Follow Keep a Changelog format

### Writing Good Documentation

- Use clear, simple language
- Include code examples
- Add visual aids (screenshots, diagrams)
- Keep it up to date
- Test your examples

## Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a discussion on GitHub
4. Ask in the issue tracker

## Recognition

Contributors will be:
- Listed in CHANGELOG.md for significant contributions
- Mentioned in release notes
- Added to contributors list (if desired)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to React Page Builder!** 🎉

Your contributions help make this project better for everyone.

