# Commit Style Guide

See [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Syntax

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

- **type** — what kind of change (see below)
- **scope** — optional, indicates which part of the codebase
- **description** — short, imperative mood, no capital letter, no period
- **!** after the type = breaking change: `feat!: remove legacy API`

---

## Types

| Type       | Use for                                                        |
| ---------- | -------------------------------------------------------------- |
| `feat`     | New feature the user can see or use                            |
| `fix`      | Bug fixed                                                      |
| `ux`       | Visible polish: copy, spacing, animations — not a new feature  |
| `refactor` | Code cleaned up, no behaviour change                           |
| `perf`     | Faster, less JS, better caching                                |
| `test`     | Tests added or fixed                                           |
| `deps`     | Packages updated                                               |
| `config`   | Config files, CI/CD, env vars, workflows                       |
| `chore`    | Everything else: renaming files, cleanup                       |
| `docs`     | README, comments, JSDoc                                        |

---

## Examples

```
feat: add dark mode toggle
feat(auth): add Google sign-in

fix: cart total not updating
fix(nav): mobile menu stays open

ux: improve button loading state
ux(forms): clearer error messages

refactor: extract auth helpers
refactor(stores): simplify cart logic

perf: lazy load product images

test: add checkout unit tests

deps: upgrade to SvelteKit 2.5
deps: bump vite to 5.4

config: add Forgejo CI workflow
config(ci): add deploy workflow
config(ci): update release pipeline

chore: remove unused assets

docs: update deploy instructions
```

### Breaking change

```
feat!: remove legacy /api/v1 routes
```

Or with footer:

```
feat: remove legacy API routes

BREAKING CHANGE: /api/v1 is no longer available, migrate to /api/v2
```

---

## Multi-line commits with body

Use the body to explain *why* the change was made:

```
refactor(components): move state access to parent pages

Components now receive data via props instead of calling getState()
directly, preventing "No state context found" errors and following
proper component design patterns.

- ComponentA: receives rank as prop
- ComponentB: receives rank and isUnlocked as props
- Updated parent page to pass required props
```

---

## Best practices

1. **Keep subject line under 72 characters** — be concise but descriptive
2. **Use imperative mood** — "add feature" not "added feature"
3. **Don't end subject with period**
4. **Add scope when relevant** — helps locate changes quickly
5. **Use body to explain "why" not "what"** — code shows what changed
6. **Reference issues/PRs in footer** — links commits to work items

---

## Release script

```bash
pnpm release         # patch (default)
pnpm release:minor   # minor
pnpm release:major   # major
```

Rule of thumb: `fix` → patch · `feat` → minor · breaking change → major
