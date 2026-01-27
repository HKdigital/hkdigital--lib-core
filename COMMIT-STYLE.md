# Conventional Commits Style Guide

## Basic Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Common Types with Examples

### feat - New features

```
feat(auth): add OAuth2 login support
feat(api): implement user profile endpoints
feat(ui): add dark mode toggle
```

### fix - Bug fixes

```
fix(login): prevent double submission on enter key
fix(parser): handle null values in JSON response
fix(GameBox): use display:none to prevent child visibility override
```

### docs - Documentation only

```
docs(readme): add installation instructions
docs(api): update endpoint examples
docs: fix typos in contributing guide
```

### style - Code formatting (no logic changes)

```
style(header): fix indentation
style: apply prettier formatting
style(css): remove unused variables
```

### refactor - Code restructuring (no behavior change)

```
refactor(auth): extract validation logic to separate module
refactor(utils): simplify date formatting function
refactor: rename getUserData to fetchUserProfile
```

### perf - Performance improvements

```
perf(images): lazy load thumbnails
perf(api): add response caching
perf(db): optimize user query with indexes
```

### test - Adding or updating tests

```
test(auth): add unit tests for login validation
test(api): increase coverage for error cases
test: fix flaky integration test
```

### chore - Maintenance, dependencies, tooling

```
chore(deps): update React to v18
chore: update .gitignore
chore(build): configure webpack for production
```

## Using Scope

Scope indicates the affected area of the codebase:

```
fix(button): correct hover state color
feat(checkout): add payment method selection
docs(api/users): document rate limiting
refactor(services/auth): simplify token refresh logic
```

## Multi-line Commits with Body

```
feat(search): add fuzzy matching algorithm

Implements Levenshtein distance for search queries to handle
typos and minor variations. Maximum edit distance of 2.

Closes #142
```

## Breaking Changes

Use `!` after type/scope or add `BREAKING CHANGE:` footer:

```
feat(api)!: change response format to JSON:API spec

BREAKING CHANGE: All API responses now follow JSON:API format.
Update client code to parse the new structure.

Migration guide: docs/migration-v3.md
```

Or in footer:

```
refactor(auth): redesign token storage

BREAKING CHANGE: JWT tokens now stored in httpOnly cookies
instead of localStorage. Update authentication flow accordingly.
```

## Multiple Issues/PRs

```
fix(validation): handle edge cases in email validator

- Fix handling of international domains
- Allow plus sign in local part
- Reject consecutive dots

Fixes #123, #124
Related to #125
```

## Quick Reference

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(chat): add emoji picker` |
| `fix` | Bug fix | `fix(form): validate on blur` |
| `docs` | Documentation | `docs: update API guide` |
| `style` | Formatting | `style: fix linting errors` |
| `refactor` | Code cleanup | `refactor: extract helper function` |
| `perf` | Performance | `perf: optimize render loop` |
| `test` | Tests | `test: add edge case coverage` |
| `chore` | Maintenance | `chore: bump dependencies` |
| `build` | Build system | `build: add production config` |
| `ci` | CI/CD | `ci: add automated tests` |

## Real-World Examples

```
feat(dashboard): add real-time notifications
fix(cors): allow requests from subdomain
perf(images): implement lazy loading with intersection observer
refactor(api): migrate from REST to GraphQL
test(checkout): add integration tests for payment flow
chore(deps): upgrade next.js to v14
docs(components): add Storybook documentation
style(components): enforce 80-character line limit
build(webpack): optimize bundle size
ci(github): add automatic PR labeling
```

## Best Practices

1. **Keep subject line under 50-72 characters**
2. **Use imperative mood** - "add feature" not "added feature"
3. **Don't end subject with period**
4. **Capitalize first letter of subject**
5. **Use body to explain "why" not "what"**
6. **Reference issues/PRs in footer**

## Benefits

1. **Automatic changelog generation** - Tools can parse commits to
   generate changelogs
2. **Semantic versioning** - `fix` = patch, `feat` = minor,
   `BREAKING CHANGE` = major
3. **Clearer git history** - Easy to scan and understand what changed
4. **Better communication** - Team members understand changes at a
   glance

## Tools That Support This Standard

- **semantic-release** - Automated versioning and releases
- **commitlint** - Lint commit messages in CI
- **conventional-changelog** - Generate changelogs automatically
- **commitizen** - Interactive CLI for writing commits
- **husky + commitlint** - Enforce format on commit

## Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
