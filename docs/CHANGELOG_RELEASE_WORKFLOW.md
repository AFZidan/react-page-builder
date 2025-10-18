# Changelog and Release Workflow

This document explains how automated changelog generation and release notes work in this project.

## Overview

The project uses **Conventional Commits** to automatically generate:
- 📝 CHANGELOG.md updates
- 🚀 GitHub Release notes
- 📦 NPM package releases

## Table of Contents

- [Conventional Commits](#conventional-commits)
- [Automated Workflows](#automated-workflows)
- [Manual Changelog Generation](#manual-changelog-generation)
- [Release Process](#release-process)
- [Examples](#examples)

## Conventional Commits

### Format

All commits should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Changelog Section | Version Bump |
|------|-------------|-------------------|--------------|
| `feat` | New feature | ✨ Features | Minor |
| `fix` | Bug fix | 🐛 Bug Fixes | Patch |
| `docs` | Documentation | 📚 Documentation | Patch |
| `style` | Code style changes | 💄 Styling | Patch |
| `refactor` | Code refactoring | ♻️  Refactoring | Patch |
| `perf` | Performance improvements | ⚡ Performance | Patch |
| `test` | Tests | ✅ Tests | Patch |
| `build` | Build system | 🏗️  Build | Patch |
| `ci` | CI/CD changes | 👷 CI/CD | Patch |
| `chore` | Other changes | 🔧 Chores | Patch |

### Examples

#### Feature
```bash
git commit -m "feat(renderer): add video component support

- Support for YouTube and Vimeo embeds
- Auto-responsive video sizing
- Custom thumbnail support"
```

#### Bug Fix
```bash
git commit -m "fix(drag-drop): prevent duplicate components on drop

Fixed issue where dropping a component would sometimes create duplicates.
Closes #123"
```

#### Breaking Change
```bash
git commit -m "feat(api): change component structure

BREAKING CHANGE: components now require 'type' field instead of 'componentType'.
Migration guide available in docs."
```

#### Documentation
```bash
git commit -m "docs(readme): update installation instructions"
```

## Automated Workflows

### 1. Release Workflow

**File:** `.github/workflows/release.yml`

**Triggers:** Push of version tags (e.g., `v1.0.0`)

**Actions:**
1. ✅ Generates CHANGELOG.md from commits
2. ✅ Extracts release notes for this version
3. ✅ Commits updated CHANGELOG.md
4. ✅ Creates GitHub Release with notes
5. ✅ Categorizes commits by type

**Usage:**
```bash
# Update version (triggers workflow)
npm version patch  # 1.0.0 → 1.0.1
# or
npm version minor  # 1.0.0 → 1.1.0
# or
npm version major  # 1.0.0 → 2.0.0
```

### 2. Changelog Preview on PR

**File:** `.github/workflows/changelog-pr.yml`

**Triggers:** Pull requests to `main` branch

**Actions:**
1. ✅ Generates changelog preview
2. ✅ Comments on PR with preview
3. ✅ Validates commit message format
4. ✅ Updates comment on new commits

**Example PR Comment:**
```markdown
## 📝 Changelog Preview

Here's what will be added to the changelog when this PR is merged:

### Features
- feat(components): add new button variants

### Bug Fixes
- fix(styles): correct margin spacing

---
*This preview is automatically generated based on your commit messages.*
```

### 3. NPM Publish Workflow

**File:** `.github/workflows/npm-publish.yml`

**Triggers:** Push of version tags (e.g., `v1.0.0`)

**Actions:**
1. ✅ Runs tests and linting
2. ✅ Builds package
3. ✅ Publishes to NPM
4. ✅ Creates GitHub Release

**Integration:** Works together with release workflow to create complete releases.

## Manual Changelog Generation

### Generate Changelog Locally

```bash
# Generate for current version
npm run changelog

# Or use the script directly
./scripts/generate-changelog.sh

# Specify a version
./scripts/generate-changelog.sh 1.2.0
```

**What it does:**
- Generates CHANGELOG.md from git commits
- Uses Conventional Commits format
- Backs up existing CHANGELOG.md
- Shows preview of changes

### Preview Release Notes

```bash
# Preview release notes for current version
npm run release:preview

# Or use the script directly
node scripts/preview-release-notes.js

# Preview from specific tag
node scripts/preview-release-notes.js v1.0.0
```

**Output:**
- Categorized list of changes
- Commit hashes for reference
- List of contributors
- Saved to `release-notes-preview.md`

**Example Output:**
```
📦 Release Notes Preview
========================

Version: 1.0.2
Changes since: v1.0.1

✨ Features
  - feat(renderer): add video component support (a1b2c3d)

🐛 Bug Fixes
  - fix(drag-drop): prevent duplicate components (d4e5f6g)

📚 Documentation
  - docs(contributing): add testing guidelines (g7h8i9j)

👥 Contributors
  - Ahmed Zidan
  - John Doe

✓ Release notes saved to: release-notes-preview.md
```

## Release Process

### Automated Release (Recommended)

1. **Make your changes** with conventional commits:
   ```bash
   git commit -m "feat(component): add new feature"
   git commit -m "fix(styles): correct layout issue"
   ```

2. **Update version** (runs tests, linting):
   ```bash
   npm version patch  # or minor/major
   ```

3. **Automated workflow** runs:
   - ✅ Generates CHANGELOG.md
   - ✅ Creates GitHub Release
   - ✅ Publishes to NPM

4. **Monitor progress:**
   - GitHub Actions: https://github.com/AFZidan/react-page-builder/actions
   - NPM: https://www.npmjs.com/package/@ahmedzidan/react-page-builder

### Manual Release

If you need manual control:

1. **Generate changelog:**
   ```bash
   npm run changelog
   ```

2. **Review and edit** CHANGELOG.md if needed

3. **Preview release notes:**
   ```bash
   npm run release:preview
   ```

4. **Commit changelog:**
   ```bash
   git add CHANGELOG.md
   git commit -m "docs(changelog): update for v1.0.2"
   ```

5. **Create version:**
   ```bash
   npm version patch
   ```

6. **Workflows run automatically**

## Examples

### Example Changelog Output

```markdown
## [1.0.2](https://github.com/AFZidan/react-page-builder/compare/v1.0.1...v1.0.2) (2025-01-19)

### Features

* **renderer:** add video component support ([a1b2c3d](https://github.com/AFZidan/react-page-builder/commit/a1b2c3d))
* **icons:** add custom icon upload ([e4f5g6h](https://github.com/AFZidan/react-page-builder/commit/e4f5g6h))

### Bug Fixes

* **drag-drop:** prevent duplicate components on drop ([d4e5f6g](https://github.com/AFZidan/react-page-builder/commit/d4e5f6g))
* **styles:** correct margin spacing in grid ([h8i9j0k](https://github.com/AFZidan/react-page-builder/commit/h8i9j0k))

### Documentation

* **contributing:** add testing guidelines ([g7h8i9j](https://github.com/AFZidan/react-page-builder/commit/g7h8i9j))
```

### Example GitHub Release Notes

```markdown
# Release v1.0.2

## ✨ Features

- feat(renderer): add video component support (a1b2c3d)
- feat(icons): add custom icon upload (e4f5g6h)

## 🐛 Bug Fixes

- fix(drag-drop): prevent duplicate components on drop (d4e5f6g)
- fix(styles): correct margin spacing in grid (h8i9j0k)

## 📚 Documentation

- docs(contributing): add testing guidelines (g7h8i9j)

## 👥 Contributors

- Ahmed Zidan
- John Doe

---

**Full Changelog**: https://github.com/AFZidan/react-page-builder/compare/v1.0.1...v1.0.2
```

## Troubleshooting

### Commits not showing in changelog

**Problem:** Some commits are missing from the generated changelog.

**Solution:**
- Ensure commits follow Conventional Commits format
- Check that commits are between the correct tags
- Verify commits aren't merge commits (they're excluded)

### Changelog preview not appearing on PR

**Problem:** PR doesn't have changelog comment.

**Solution:**
- Check GitHub Actions status
- Ensure PR is targeting `main` branch
- Verify workflow file exists and is valid
- Check that commits don't have `[skip ci]` tag

### Release workflow fails

**Problem:** Release workflow fails during changelog generation.

**Solution:**
1. Check GitHub Actions logs
2. Verify `conventional-changelog-cli` installation
3. Ensure git history is available (fetch-depth: 0)
4. Check for conflicts in CHANGELOG.md

### Invalid commit messages

**Problem:** Workflow warns about invalid commit format.

**Solution:**
```bash
# Amend last commit
git commit --amend -m "feat(scope): proper message"

# Rebase and edit older commits
git rebase -i HEAD~3
# Change 'pick' to 'reword' for commits to fix
```

## Best Practices

### Writing Good Commit Messages

✅ **Good:**
```bash
feat(renderer): add video component support

- YouTube and Vimeo embeds
- Auto-responsive sizing
- Custom thumbnails

Closes #123
```

❌ **Bad:**
```bash
added video stuff
```

### Scope Guidelines

Use scopes to categorize changes:
- `(renderer)` - Renderer component
- `(builder)` - Page builder component
- `(components)` - UI components
- `(styles)` - Styling changes
- `(api)` - API changes
- `(docs)` - Documentation
- `(tests)` - Testing

### Breaking Changes

Always document breaking changes:

```bash
feat(api): change component prop names

BREAKING CHANGE: Renamed 'componentType' to 'type' for consistency.

Migration:
- Change all `componentType` to `type` in component definitions
- Update your imports if using TypeScript types
```

## Configuration

### Customizing Changelog

The changelog configuration uses the **Angular preset**. To customize:

1. Install conventional-changelog-cli globally or locally
2. Create `.versionrc.json` in project root:
   ```json
   {
     "types": [
       {"type": "feat", "section": "✨ Features"},
       {"type": "fix", "section": "🐛 Bug Fixes"},
       {"type": "docs", "section": "📚 Documentation"},
       {"type": "style", "section": "💄 Styling"},
       {"type": "refactor", "section": "♻️  Refactoring"},
       {"type": "perf", "section": "⚡ Performance"},
       {"type": "test", "section": "✅ Tests"}
     ]
   }
   ```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Questions?** Open an issue or check the [Contributing Guide](./CONTRIBUTING.md)

