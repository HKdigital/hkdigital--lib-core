# Release workflow

Releases are triggered locally with a pnpm script. Pushing the resulting
version tag kicks off the Forgejo CI workflow that builds and publishes
the package to the registry.

## Commands

```bash
pnpm release         # patch — default, e.g. 0.5.102 → 0.5.103
pnpm release:minor   # minor — e.g. 0.5.x → 0.6.0
pnpm release:major   # major — e.g. 0.x.y → 1.0.0
```

Rule of thumb: `fix` → patch · `feat` → minor · breaking change → major

## What each command does

1. **guard** — aborts if the current branch is not `main`
2. **version** — bumps `package.json`, commits the change, creates a git
   tag (`v<major>.<minor>.<patch>`)
3. **push** — pushes the commit and tag (`git push --follow-tags`)

## CI workflow

The Forgejo workflow (`.forgejo/workflows/release.yml`) triggers on any
tag matching `v[0-9]+.[0-9]+.[0-9]+` and runs the following steps:

1. Verifies the tagged commit is an ancestor of `main`
2. Installs dependencies (`pnpm install --frozen-lockfile`)
3. Builds the package (`pnpm prepack`)
4. Configures the Forgejo npm registry using repository secrets
5. Publishes with `npm publish --access public`

## Required repository secrets

| Secret               | Description                              |
| -------------------- | ---------------------------------------- |
| `PACKAGES_REGISTRY`  | Forgejo host (e.g. `git.hkdigital.nl`)   |
| `PACKAGES_ORG`       | Forgejo org name (e.g. `hkdigital`)      |
| `PACKAGES_TOKEN`     | Token with `packages:write` scope        |

## Adding release scripts to a project

Copy the following scripts into `package.json`:

```json
"release": "pnpm run release:patch",
"release:guard": "git branch --show-current | grep -qx main || (echo 'Not on main branch' && exit 1)",
"release:patch": "pnpm run release:guard && pnpm version patch && git push --follow-tags",
"release:minor": "pnpm run release:guard && pnpm version minor && git push --follow-tags",
"release:major": "pnpm run release:guard && pnpm version major && git push --follow-tags"
```
