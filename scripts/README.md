# DyneMCP Versioning System

This directory contains scripts for managing versioning and publishing of packages in the DyneMCP monorepo.

## Overview

The versioning system is built on top of [Changesets](https://github.com/changesets/changesets), which provides a way to manage versions and changelogs in a monorepo. The system supports three types of releases:

- **Canary**: Automatically published from the `main` branch, containing the latest changes with a pre-release tag.
- **Release Candidate (RC)**: Manually triggered releases for testing before a stable release.
- **Stable**: Production-ready releases that are published to the `latest` npm tag.

## How to Use

### Creating a Changeset

When you make changes that should be released, create a changeset to document those changes:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages have changed
2. Choose the semver bump type (patch, minor, major)
3. Write a summary of the changes

The changeset will be stored in the `.changeset` directory and will be used when releasing.

### Release Commands

The following commands are available for releasing:

- **Canary Release**: Automatically runs on push to `main` branch

  ```bash
  pnpm run release:canary
  ```

- **Release Candidate**: Manually triggered from GitHub Actions

  ```bash
  pnpm run release:rc
  ```

- **Stable Release**: Manually triggered from GitHub Actions
  ```bash
  pnpm run release:stable
  ```

## How It Works

The versioning system consists of two main scripts:

1. **version-packages.js**: Handles versioning of packages based on changesets
   - Exits any previous pre-release mode
   - Sets up the appropriate pre-release mode (canary, rc) if needed
   - Creates an empty changeset if none exist (for canary releases)
   - Runs `changeset version` to update package versions
   - Updates the lockfile

2. **publish-packages.js**: Handles publishing packages to npm
   - Determines the appropriate npm tag based on release type
   - Skips private and non-publishable packages
   - Publishes each package with the correct tag

## GitHub Actions Integration

The versioning system is integrated with GitHub Actions:

- **Canary Release Workflow**: Automatically runs on push to `main`
- **Release Workflow**: Manually triggered for RC and stable releases

## NX Integration

The versioning tasks are integrated with NX for efficient caching and dependency management:

- `version-packages`: Depends on build and uses changesets as inputs
- `publish-packages`: Depends on build and version-packages

NX's powerful caching system ensures that these tasks are only run when necessary, improving the overall development experience.
