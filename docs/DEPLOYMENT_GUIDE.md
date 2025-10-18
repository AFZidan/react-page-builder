# Deployment Guide

This guide explains how to automatically deploy the React Page Builder package to npmjs.

## Setup Instructions

### 1. Install Dependencies

First, install all the required dependencies:

```bash
npm install
```

This will install testing libraries, ESLint, Vitest, and all other dev dependencies.

### 2. Create NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to **Account Settings → Access Tokens**
3. Click **"Generate New Token"**
4. Choose **"Automation"** type (for CI/CD)
5. Copy the token (you won't see it again!)

### 3. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **"Add secret"**

## Workflows

### Automatic NPM Publishing

The package will automatically publish to npm when you push a version tag:

**Workflow file:** `.github/workflows/npm-publish.yml`

**Triggers:** Push of tags matching `v*` (e.g., `v1.0.0`, `v1.2.3`)

**Steps:**
1. ✅ Checkout code
2. ✅ Setup Node.js 18
3. ✅ Install dependencies
4. ✅ Run ESLint checks
5. ✅ Run unit tests
6. ✅ Build package
7. ✅ Verify build output
8. ✅ Check version consistency
9. ✅ Dry-run publish
10. ✅ Publish to npm
11. ✅ Create GitHub release

### Pull Request Checks

Automatic quality checks run on every pull request:

**Workflow file:** `.github/workflows/pr-check.yml`

**Triggers:** Pull requests to `main` or `develop` branches

**Jobs:**

#### Quality Checks
- ESLint validation
- Unit tests
- Build verification
- Bundle size reporting

#### Test Coverage
- Run tests with coverage
- Upload to Codecov (optional)

## Deployment Process

### Step 1: Make Your Changes

```bash
# Make your code changes
git add .
git commit -m "Your commit message"
```

### Step 2: Run Local Checks

Before publishing, test everything locally:

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build
```

### Step 3: Update Version

Use npm's version command to update the version in `package.json`:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

**What happens automatically:**
1. Runs linter (via `preversion` script)
2. Runs tests (via `preversion` script)
3. Updates `package.json` version
4. Creates a git commit
5. Creates a git tag (e.g., `v1.0.1`)
6. Pushes changes and tags (via `postversion` script)

### Step 4: Automatic Publishing

Once the version tag is pushed, GitHub Actions will:
1. Run all quality checks
2. Build the package
3. Publish to npm
4. Create a GitHub release

**Monitor the deployment:**
- Go to your GitHub repository
- Click on **"Actions"** tab
- Watch the "Publish to NPM" workflow

## Manual Publishing (Emergency)

If you need to publish manually:

```bash
# Login to npm
npm login

# Build the package
npm run build

# Publish
npm publish --access public
```

## Available Commands

### Testing
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui       # Run tests with interactive UI
```

### Linting
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
```

### Building
```bash
npm run build         # Build the package for production
npm run dev           # Build in watch mode for development
```

### Version Management
```bash
npm version patch     # 1.0.0 -> 1.0.1
npm version minor     # 1.0.0 -> 1.1.0
npm version major     # 1.0.0 -> 2.0.0
```

## Troubleshooting

### Tests Failing

```bash
# Run tests in watch mode to debug
npm run test:watch

# Check test coverage
npm run test:coverage

# Open coverage report
open coverage/index.html
```

### Linting Errors

```bash
# See what's wrong
npm run lint

# Auto-fix most issues
npm run lint:fix
```

### Build Errors

```bash
# Clean build
rm -rf dist/
npm run build
```

### Version Mismatch

If the GitHub Action fails with "Version mismatch", ensure:
1. Your `package.json` version matches the git tag
2. You pushed both the commit AND the tag:
   ```bash
   git push origin main
   git push origin --tags
   ```

### NPM Token Issues

If publishing fails with authentication error:
1. Verify your NPM token is valid (check npmjs.com)
2. Ensure the GitHub secret `NPM_TOKEN` is set correctly
3. Token type must be "Automation" (not "Classic" or "Granular")

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep commits atomic** - one feature/fix per commit
3. **Write meaningful commit messages**
4. **Update CHANGELOG.md** before versioning
5. **Test the built package** locally before publishing:
   ```bash
   npm run build
   npm pack
   # Test the .tgz file in another project
   ```
6. **Use semantic versioning** correctly:
   - PATCH: Bug fixes
   - MINOR: New features (backwards compatible)
   - MAJOR: Breaking changes

## CI/CD Flow Diagram

```
Developer Push
      ↓
  Git Tag (v*)
      ↓
GitHub Actions Triggered
      ↓
  ├─ Install Dependencies
  ├─ Run Linter ✓
  ├─ Run Tests ✓
  ├─ Build Package ✓
  ├─ Verify Build ✓
  └─ Check Version ✓
      ↓
  Publish to NPM 🚀
      ↓
Create GitHub Release 📦
```

## Support

If you encounter any issues:
1. Check the [GitHub Actions logs](https://github.com/AFZidan/react-page-builder/actions)
2. Review the [npm package page](https://www.npmjs.com/package/@AFZidan/react-page-builder)
3. Open an issue on GitHub

---

**Happy Deploying! 🚀**

