# SvelteKit Library

## Project Overview
This is a modern SvelteKit library built with Svelte 5 and Skeleton.dev v3 components. The project emphasizes accessibility, clean code standards, and modern JavaScript patterns.

## Architecture & Structure
- **Framework**: SvelteKit with Svelte 5 runes
- **UI Components**: Skeleton.dev version 3
- **Package Manager**: PNPM
- **Language**: Modern JavaScript (ES6+), no TypeScript
- **Module System**: ES Modules only (import/export)

## Key Technical Decisions
- Uses Svelte 5 runes (`$state()`, `$derived()`, `$effect()`, `$props()`) for state management
- Snippet syntax with `{@render children()}` instead of deprecated `<slot />`
- WCAG 2.1 Level AA accessibility compliance
- 80-character line limit with rare exceptions
- Two-space indentation
- Descriptive camelCase naming conventions

## Component Patterns
- All components use `let { ... } = $props()` with JSDoc type annotations
- Props always include `classes` and `...attrs` for flexibility
- Event handlers use Svelte 5 syntax (`onclick`, `onchange`)
- Snippet props typed as `import('svelte').Snippet`
- Private methods use hash prefix (`#methodName`)

## Development Standards
- Readable code over concise code
- Explicit error handling with try/catch for async operations
- JSDoc comments for all functions and variables
- English for all documentation and comments
- No dollar signs in variable names (reserved for Svelte)

## Accessibility Requirements
- Proper ARIA roles, states, and properties
- Descriptive aria-labels for interactive elements
- Keyboard navigation support
- Logical tab order and focus management
- Proper heading hierarchy
- Screen reader compatibility (VoiceOver, NVDA)

## Common Patterns to Follow
- Server/client code separation in SvelteKit
- Clear component hierarchy
- Minimal, targeted changes to working code
- Ask before making assumptions about existing structure
- Focus on specific requests rather than general improvements

## What Not to Do
- Don't use deprecated Svelte 4 syntax
- Don't mix slot and snippet syntax
- Don't use TypeScript syntax
- Don't use CommonJS (require/module.exports)
- Don't use underscore prefixes for private methods
- Don't modify unrelated code unless necessary
