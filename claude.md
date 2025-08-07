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

## Writing Style
- Use normal English capitalization rules - avoid unnecessary capitals
- Don't capitalize common nouns like "server", "client", "button", "error", "validation", etc.
- Only capitalize proper nouns, beginnings of sentences, and official names
- Examples:
  - ✅ "server-side validation" not "Server-side Validation"  
  - ✅ "expect function" not "Expect Function"
  - ✅ "client error" not "Client Error"
  - ✅ "JavaScript" (proper noun) but "validation error" (common noun)

## Import Path Conventions
- Use `$lib/domain/...` imports for cross-domain references (e.g., `$lib/media/image.js`, `$lib/network/http.js`)
- Use relative imports (`./` or `../`) when staying within the same main folder under `$lib`
- **Always include file extensions** (`.js`, `.svelte`) in import statements
- **Always use `/index.js`** for directory imports instead of directory-only paths - this ensures compatibility outside the library
- Examples:
  - ✅ `import { ImageLoader } from '$lib/media/image.js'` (from components to media)
  - ✅ `import ImageLoader from './ImageLoader.svelte.js'` (within media/image folder)
  - ✅ `import { v, HumanUrl } from '$lib/valibot/index.js'` (explicit index.js)
  - ❌ `import { v, HumanUrl } from '$lib/valibot'` (missing /index.js)
  - ❌ `import something from '../../media/image.js'` (cross-domain relative import)

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

## Design System Usage in Examples

When creating examples in `routes/examples/`, always use the HKdigital Design System:

### Typography
- Use complete typography classes: `type-heading-h1`, `type-base-md`, `type-ui-sm`
- Include dark mode variants when relevant: `type-heading-h1-dark`
- Never use raw Tailwind text classes like `text-lg` - use `text-base-lg` instead

### Spacing
- Use UI points for element spacing: `p-20up`, `m-10up`, `gap-16up`
- Use text-based spacing for typography-related spacing: `mb-16bt`, `mt-12ut`
- Never use raw Tailwind spacing like `p-4` - use `p-4up` instead

### Colors
- Use themed colors: `bg-primary-500`, `bg-surface-100`, `text-error-500`
- Always use contrast colors for accessibility: `text-primary-contrast-500`
- Include both light and dark mode considerations

### Layout & Components
- Use design system utilities: `rounded-md`, `border-width-normal`
- Follow the responsive scaling system built around 1024×768 design reference
- Use component data attributes: `data-component="button"` `data-role="primary"`

### Custom Styling for Examples
When examples require custom CSS beyond the design system:

- Always add a `data-page` attribute to the outer page element
- Create a `style.css` file alongside the `+page.svelte` file
- Use `<style src="./style.css"></style>` to include the styles
- Scope all CSS rules under `[data-page]` to prevent global conflicts
- Use CSS nesting syntax for better organization

**Example structure:**
```svelte
<!-- +page.svelte -->
<div data-page>
  <div data-section="content">
    <!-- example content -->
  </div>
</div>

<style src="./style.css"></style>
```

```css
/* style.css */
[data-page] {
  & [data-section="content"] {
    /* scoped styles here */
    position: relative;
    padding: 20px;
  }
  
  & .custom-element {
    /* more scoped styles */
  }
}
```

### Structure
- Always include proper heading hierarchy (`type-heading-h1`, `type-heading-h2`, etc.)
- Use semantic HTML with appropriate ARIA attributes
- Follow WCAG 2.1 Level AA accessibility guidelines

### UI Components
- Always use components from `$lib/ui/primitives/` when available
- Prefer the `Button` component over raw `<button>` elements
- Import from the index: `import { Button } from '$lib/ui/primitives/index.js'`
- Use snippet syntax: `<Button>{content}</Button>` instead of slot syntax

### Example Template
```svelte
<script>
  import { Button } from '$lib/ui/primitives/index.js';
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Example Title</h1>
  
  <div class="card p-16up mb-16up">
    <p class="type-base-md mb-12bt">Description text</p>
    <Button>
      Action
    </Button>
  </div>
</div>

<!-- Only include if custom CSS is needed -->
<style src="./style.css"></style>
```

## What Not to Do
- Don't use deprecated Svelte 4 syntax
- Don't mix slot and snippet syntax
- Don't use TypeScript syntax
- Don't use CommonJS (require/module.exports)
- Don't use underscore prefixes for private methods
- Don't modify unrelated code unless necessary
