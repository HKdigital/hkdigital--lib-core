# Library branch strategy

## About

This document describes the branch strategy for this library.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, always reflects the latest published version |
| `publish` | Triggers the publish workflow when pushed |
| `<developer>` | Permanent developer branches, merged into `main` when ready to release |

## Workflow

### Development

Each developer works in their own branch. When work is ready to be released, it is merged into `main`.

### Publishing a new version

1. Merge `main` into `publish` and push
2. The publish workflow runs automatically and will:
   - Bump the version in `package.json` (patch / minor / major)
   - Build the library
   - Publish to npm
   - Create a git tag (e.g. `v2.0.4`)
   - Merge `publish` back into `main` to keep the version bump in sync

The workflow can also be triggered manually via GitHub Actions with a chosen version bump type.

## Automation

GitHub Actions can be configured to run tests or other checks when commits are pushed to any branch.
