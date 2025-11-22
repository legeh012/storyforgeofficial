# Release Guide

This guide explains how to create releases for SomaHertigateApp using automated GitHub workflows.

## Automated Release System

The project uses GitHub Actions to automate version tagging, changelog generation, and release creation.

## Creating a New Release

### Method 1: Manual Version Bump (Recommended)

1. **Trigger the Version Bump Workflow**:
   - Go to GitHub → Actions → "Version Bump" workflow
   - Click "Run workflow"
   - Select version bump type:
     - `patch` - Bug fixes (1.0.0 → 1.0.1)
     - `minor` - New features (1.0.0 → 1.1.0)
     - `major` - Breaking changes (1.0.0 → 2.0.0)
   - Click "Run workflow"

2. **Automatic Process**:
   - Workflow updates `package.json` version
   - Creates a git commit with version bump
   - Creates and pushes a version tag (e.g., `v1.2.3`)
   - Release workflow automatically triggers
   - Release is created with changelog and build artifacts

### Method 2: Manual Tag Creation

```bash
# Make sure you're on main branch
git checkout main
git pull

# Update version in package.json manually
npm version patch  # or minor, or major

# Push changes and tag
git push origin main
git push origin --tags
```

The release workflow will automatically trigger when the tag is pushed.

## What Gets Automated

### Changelog Generation
- Automatically generates changelog from git commits
- Groups commits since last release
- Includes commit hashes for reference

### Release Notes
- Creates detailed release notes
- Includes installation instructions
- Links to full changelog

### Build Artifacts
- Automatically builds the project
- Creates a production-ready ZIP file
- Attaches to the GitHub release

## Version Numbering Convention

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, major new features
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Commit Message Best Practices

Use clear commit messages for better changelogs:

```bash
git commit -m "feat: add new video generation presets"
git commit -m "fix: resolve auth token expiration issue"
git commit -m "docs: update local deployment guide"
git commit -m "perf: optimize video rendering performance"
```

**Prefixes**:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `perf:` - Performance improvements
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

## Viewing Releases

1. Go to your GitHub repository
2. Click "Releases" in the sidebar
3. View all published releases with changelogs and downloads

## Release Artifacts

Each release includes:
- **Source Code** (automatically added by GitHub)
- **Build Artifact** (`storyforgeofficial-v1.2.3.zip`) - Production-ready build
- **Changelog** - All commits since previous release
- **Installation Instructions** - How to run locally or in production

## Troubleshooting

### Release Workflow Not Triggering

**Check**:
- Tag format matches `v*.*.*` (e.g., `v1.0.0`)
- Tag was pushed to GitHub: `git push origin v1.0.0`
- GitHub Actions are enabled in repository settings

### Build Artifacts Missing

**Check**:
- `npm run build` completes successfully locally
- All dependencies are listed in `package.json`
- `dist/` directory is created after build

### Changelog Empty or Incomplete

**Issue**: No commits found between releases

**Solution**: Ensure you're pushing commits before creating tags

```bash
git add .
git commit -m "feat: add new features"
git push origin main
npm version patch
git push origin --tags
```

## Manual Release (Fallback)

If automated workflows fail, create releases manually:

1. Go to GitHub → Releases → "Draft a new release"
2. Create a tag (e.g., `v1.0.0`)
3. Generate release notes automatically
4. Upload build artifacts manually
5. Publish release

## Next Steps

After setting up automated releases:

1. ✅ Push your code to `https://github.com/legeh012/storyforgeofficial.git`
2. ✅ Create your first release using the Version Bump workflow
3. ✅ Share release links with collaborators
4. ✅ Set up notifications for new releases

---

**Project**: SomaHertigateApp  
**Repository**: https://github.com/legeh012/storyforgeofficial
