# Project branch strategy

## About

This document describes the branch strategy for projects using this library.

## Branches

| Branch | Purpose |
|--------|---------|
| `production` | Live production version |
| `next` | Release testing / staging |
| `previous` | Previous production version (archive) |

## Automation

GitHub Actions, coolify or other tools can be configured to build and deploy
when commits are pushed.

## Releasing a new production version

### 1. Tag the current production version before updating it

```bash
git checkout production
git tag -a v2.0.4-prod -m "Production version 2.0.4"
git push origin v2.0.4-prod
```

### 2. Point `previous` to that tag

```bash
git checkout previous
git reset --hard v2.0.4-prod
git push origin previous --force
```

### 3. Merge `next` into `production`

```bash
git checkout production
git merge next
git push origin production
```

## Notes

- Tags are repository-wide, not branch-specific
- Pushing a tag does not trigger branch-based CI/CD events
- Force pushing `previous` is safe as it is an archive branch — no active development happens there
- To see all tags: `git tag`
- To see all tags on remote: `git ls-remote --tags origin`
