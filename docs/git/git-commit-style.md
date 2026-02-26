# Commit Style Guide

## Basic Structure

```
[PREFIX] (scope): description

[optional body]

[optional footer(s)]
```

## Quick Example

```
[FIX] (login): prevent double submission on enter key
```

---

## Features & Content

| Prefix   | When to Use                                       |
|----------|---------------------------------------------------|
| `[FEAT]` | New feature implementation                        |
| `[ADD]`  | Adding new files, components, or minor additions  |
| `[DATA]` | Data updates, content changes                     |

### [FEAT] - New features

```
[FEAT] (auth): add OAuth2 login support
[FEAT] (api): implement user profile endpoints
[FEAT] (ui): add dark mode toggle
```

### [ADD] - Adding new files or components

```
[ADD] (components): add reusable Card component
[ADD] (utils): add date formatting helpers
[ADD] (pages): add settings page
```

### [DATA] - Data and content updates

```
[DATA] (translations): update Dutch language strings
[DATA] (config): update API endpoints for production
[DATA] (content): refresh homepage copy
```

---

## Code Quality

| Prefix       | When to Use                                      |
|--------------|--------------------------------------------------|
| `[FIX]`      | Bug fixes                                        |
| `[REFACTOR]` | Code restructuring without changing behavior     |

### [FIX] - Bug fixes

```
[FIX] (login): prevent double submission on enter key
[FIX] (parser): handle null values in JSON response
[FIX] (.npmrc): update NPM token
```

### [REFACTOR] - Code restructuring

```
[REFACTOR] (auth): extract validation logic to separate module
[REFACTOR] (utils): simplify date formatting function
[REFACTOR] (components): move state access to parent pages
```

---

## Dependencies & Configuration

| Prefix     | When to Use                                    |
|------------|------------------------------------------------|
| `[DEPS]`   | Dependency updates                             |
| `[CONFIG]` | Configuration files, tooling setup             |
| `[BUILD]`  | Build system, bundler configuration, CI/CD     |

### [DEPS] - Dependency updates

```
[DEPS] (package.json): update dependencies to latest versions
[DEPS] (package.json): update @hkdigital/lib-core to v2.3.4
[DEPS] (pnpm): upgrade pnpm to v9.0.0
```

### [CONFIG] - Configuration and tooling

Configuration files and tooling setup:

```
[CONFIG] (git): update .gitignore
[CONFIG] (eslint): update linting rules
[CONFIG] (prettier): configure code formatting
[CONFIG] (editor): add VS Code settings
```

### [BUILD] - Build system and CI/CD

Build configuration, bundler setup, and continuous integration:

```
[BUILD] (webpack): configure webpack for production
[BUILD] (vite): optimize build configuration
[BUILD] (ci): add automated deployment
[BUILD] (docker): update container configuration
```

---

## Design & Styling

| Prefix     | When to Use                                      |
|------------|--------------------------------------------------|
| `[DESIGN]` | Design system, tokens, foundational design       |
| `[STYLE]`  | Component styling, CSS/Tailwind changes          |
| `[UI]`     | UI improvements, layout changes, UX enhancements |

### [DESIGN] - Design system changes

Design system, tokens, and foundational design changes (use [STYLE] or [UI] for component implementation):

```
[DESIGN] (tokens): update color palette values
[DESIGN] (system): add spacing scale to design tokens
[DESIGN] (typography): update font definitions
```

### [STYLE] - Component styling

CSS, Tailwind, and component styling implementation:

```
[STYLE] (Button): update hover states per design specs
[STYLE] (components): apply new spacing system
[STYLE] (layout): improve responsive breakpoints
```

### [UI] - UI/UX improvements

```
[UI] (dashboard): improve layout and spacing
[UI] (navigation): enhance mobile menu experience
[UI] (forms): add better validation feedback
```

---

## Documentation & Testing

| Prefix   | When to Use               |
|----------|---------------------------|
| `[DOCS]` | Documentation updates     |
| `[TEST]` | Adding or updating tests  |

### [DOCS] - Documentation

```
[DOCS] (readme): add installation instructions
[DOCS] (api): update endpoint examples
[DOCS] (contributing): add commit style guide
```

### [TEST] - Tests

```
[TEST] (auth): add unit tests for login validation
[TEST] (api): increase coverage for error cases
[TEST] (integration): add end-to-end checkout tests
```

---

## Performance & Security

| Prefix       | When to Use              |
|--------------|--------------------------|
| `[PERF]`     | Performance improvements |
| `[SECURITY]` | Security fixes           |

### [PERF] - Performance improvements

```
[PERF] (images): implement lazy loading with intersection observer
[PERF] (api): add response caching
[PERF] (db): optimize user query with indexes
```

### [SECURITY] - Security fixes

```
[SECURITY] (auth): patch XSS vulnerability
[SECURITY] (api): add rate limiting
[SECURITY] (deps): update package with known vulnerability
```

---

## Special Cases

| Prefix       | When to Use                          |
|--------------|--------------------------------------|
| `[INIT]`     | Initial setup, project initialization|
| `[BREAKING]` | Breaking changes                     |
| `[REVERT]`   | Reverting previous commits           |
| `[WIP]`      | Work in progress (temporary commits) |
| `[HOTFIX]`   | Urgent production fixes              |

### [INIT] - Initial setup

```
[INIT] (project): set up repository structure
[INIT] (config): configure ESLint and Prettier
[INIT] (ci): set up GitHub Actions workflow
```

### [BREAKING] - Breaking changes

For breaking changes, use the `[BREAKING]` prefix or add `BREAKING CHANGE:` in the footer:

```
[BREAKING] (api): change response format to JSON:API spec

BREAKING CHANGE: All API responses now follow JSON:API format.
Update client code to parse the new structure.

Migration guide: docs/migration-v3.md
```

Or add breaking change footer to other prefixes:

```
[REFACTOR] (auth): redesign token storage

BREAKING CHANGE: JWT tokens now stored in httpOnly cookies
instead of localStorage. Update authentication flow accordingly.
```

### [REVERT] - Reverting commits

```
[REVERT] (feature): revert authentication changes
[REVERT] (api): revert to previous endpoint structure
```

### [WIP] - Work in progress

Use for temporary commits that will be cleaned up later:

```
[WIP] (checkout): partial payment flow implementation
[WIP] (feature): exploring new approach
```

### [HOTFIX] - Urgent production fixes

```
[HOTFIX] (payment): fix critical checkout bug
[HOTFIX] (api): resolve server timeout issue
```

---

## Using Scope

Scope indicates the affected area of the codebase:

```
[FIX] (button): correct hover state color
[FEAT] (checkout): add payment method selection
[DOCS] (api/users): document rate limiting
[REFACTOR] (services/auth): simplify token refresh logic
[FIX] (.npmrc): update configuration token
```

---

## Multi-line Commits with Body

Use the body to explain "why" the change was made and provide context:

```
[REFACTOR] (components): move state access to parent pages

Components now receive data via props instead of calling getState()
directly, preventing "No state context found" errors and following proper
component design patterns.

- ComponentA: receives rank as prop
- ComponentB: receives rank and isUnlocked as props
- Updated parent page to pass required props
```

Another example:

```
[FEAT] (search): add fuzzy matching algorithm

Implements Levenshtein distance for search queries to handle
typos and minor variations. Maximum edit distance of 2.

Closes #142
```

---

## Multiple Changes in One Commit

You can use multiple prefixes when a commit includes different types of changes:

```
[FEAT] (map): add navigation implementation
[FEAT] (data): add profession definitions
```

Or combine related changes:

```
[FIX] (auth): resolve token refresh issues

- Fix token expiration check
- Add retry logic for failed refreshes
- Update error handling

Fixes #234
```

---

## Best Practices

1. **Keep subject line under 72 characters** - Be concise but descriptive
2. **Use imperative mood** - "add feature" not "added feature"
3. **Don't end subject with period**
4. **Add scope when relevant** - Helps locate changes quickly
5. **Use body to explain "why" not "what"** - Code shows what changed
6. **Reference issues/PRs in footer** - Links commits to work items
7. **Commit related changes together** - But keep commits focused
8. **Choose the most specific prefix** - Use [FIX] over [CONFIG] for bug fixes
9. **Use categories to find the right prefix** - Scan the category tables above

Or use git hooks (husky + commitlint) to enforce the format.
