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

## JavaScript Class Patterns
- Use modern ES private methods with hash prefix: `#methodName()` instead of `_methodName()`
- Private fields also use hash prefix: `#privateField`
- Apply this to all JavaScript classes, not just Svelte components
- Never use `@private` in JSDoc for methods that start with `#` - the hash already indicates privacy

## Development Standards
- Readable code over concise code
- Explicit error handling with try/catch for async operations
- JSDoc comments for all functions and variables
- English for all documentation and comments
- No dollar signs in variable names (reserved for Svelte)

### Testing Commands
- Run all tests: `pnpm test`
- Run specific test file: `pnpm test:file path/to/test.js`
- Run tests in directory: `pnpm test:file src/lib/logging/`
- Use `pnpm test:file` for single test execution - it's cross-platform compatible

### ESLint Rule Suppression
- Use specific rule suppression instead of blanket disables
- For unused variables in method signatures (e.g., base class methods to be overridden):
  ```javascript
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig = null) {
    // Override in subclass
  }
  ```

## Documentation & Comment Style
- **80-character line limit** - strictly enforce for ALL code and documentation
  - Applies to code lines, JSDoc comments, parameter descriptions, and all text
  - Wrap long JSDoc descriptions across multiple lines
  - Break long parameter lists and descriptions at 80 characters
- **JSDoc formatting conventions:**
  - Blank line between description and first `@param`
  - Blank line between last `@param` and `@returns`
  - No blank lines between consecutive `@param` tags with short descriptions
  - Add extra newlines between `@param` entries ONLY when they have multi-line descriptions for better readability
  - For long parameter types or descriptions, place description on next line:
    ```javascript
    // Multi-line @param descriptions (use extra newlines between)
    /**
     * Convert a path string to an array path
     *
     * @param {string|string[]} path
     *   String or array path (e.g. "some.path.to")
     *
     * @param {string} [pathSeparator=PATH_SEPARATOR]
     *   A custom path separator to use instead of the default "."
     *
     * @returns {string[]} array path (e.g. ["some", "path", "to"])
     */

    // Short descriptions (no extra newlines needed)
    /**
     * Log an info message
     *
     * @param {string} message - Log message
     * @param {*} [details] - Additional details
     *
     * @returns {boolean} True if the log was emitted
     */
    ```
- **Concise descriptions** - avoid obvious/redundant explanations
- Keep only essential information that adds value for developers
- Remove descriptions that simply restate parameter names or types
- Examples:
  - ✅ `@property {number} [exp] - Expiration time (seconds since epoch)`
  - ❌ `@property {number} [exp] - Expiration time - timestamp when the JWT expires`
  - ✅ `@property {boolean} [ignoreExpiration] - Skip expiration validation`  
  - ❌ `@property {boolean} [ignoreExpiration] - If true, do not validate the expiration of the token`

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
- **Prefer barrel exports** - Use higher-level export files when available (e.g., `$lib/ui/components.js` instead of `$lib/ui/components/profile/ProfileBlocks.svelte`)
- **For cross-domain imports, use specific export files** (e.g., `parsers.js`, `valibot.js`) rather than directory-only paths - this ensures compatibility outside the library
- **For local imports within the same domain**, import specific files directly (e.g., `./ClassName.js`) rather than using local index files
- Examples:
  - ✅ `import { ProfileBlocks } from '$lib/ui/components.js'` (barrel export - preferred)
  - ✅ `import { Button } from '$lib/ui/primitives.js'` (barrel export - preferred)
  - ✅ `import { ImageLoader } from '$lib/media/image.js'` (cross-domain import)
  - ✅ `import ImageLoader from './ImageLoader.svelte.js'` (local import within same domain)
  - ✅ `import IterableTree from './IterableTree.js'` (local import within same domain)
  - ✅ `import { v } from '$lib/valibot/valibot.js'` (cross-domain with specific export file)
  - ✅ `import { HumanUrl, Email } from '$lib/valibot/parsers.js'` (cross-domain with specific export file)
  - ❌ `import ProfileBlocks from '$lib/ui/components/profile/ProfileBlocks.svelte'` (deep import when barrel exists)
  - ❌ `import { v, HumanUrl } from '$lib/valibot'` (missing specific export file)
  - ❌ `import { IterableTree } from './index.js'` (local index when specific file should be used)
  - ❌ `import something from '../../media/image.js'` (cross-domain relative import)

**Import validation:** Run `node scripts/validate-imports.mjs` to validate import patterns. The validator checks for barrel export files at each level and suggests the highest-level file that exports your target. These rules are enforced for `src/lib/` files only. Files in `src/routes/` can use relative imports freely. See README.md "Import Validation" section for usage in other projects.

### Critical: Aliases in Libraries vs Apps

**IMPORTANT**: Due to Vite/SvelteKit limitations, aliases in library
code (`src/lib/**`) must resolve to paths **inside the project folder**.
Aliases to external packages or paths outside the project break when
building libraries.

**The problem:**
```javascript
// ❌ These aliases don't work in src/lib/** files:
// svelte.config.js
alias: {
  '$ext': 'node_modules/@hkdigital/lib-core/dist',  // Outside project
  '$pkg': '@hkdigital/lib-core'  // Package name (doesn't resolve)
}

// In src/lib/** - BREAKS during build!
import { Button } from '$ext/ui/primitives.js';
```

**The solution:**
- **In library code (`src/lib/**`)**: Use direct package imports
- **In app code (`src/routes/**`)**: Aliases work fine

```javascript
// ✅ Library code - use direct imports
import { Button } from '@hkdigital/lib-core/ui/primitives.js';

// ✅ App code - aliases OK (not built/published)
import { Button } from '$ext/ui/primitives.js';
```

**Local aliases work everywhere:**
```javascript
// svelte.config.js
alias: {
  '$lib': 'src/lib',  // ✅ Inside project - works everywhere
  '$examples': 'src/routes/examples'  // ✅ Inside project
}
```

**Why**: Vite/SvelteKit aliases are designed for internal project
structure. Build tools cannot properly handle aliases pointing outside
the project or to package names.

## Class Export Conventions
- **All classes should be default exports**: `export default class ClassName`
- **Import classes without destructuring**: `import ClassName from './ClassName.js'`
- Examples:
  - ✅ `export default class HkPromise extends Promise {}`
  - ✅ `import HkPromise from './HkPromise.js'`
  - ❌ `export class HkPromise extends Promise {}` (named export)
  - ❌ `import { HkPromise } from './HkPromise.js'` (destructuring import)

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
- Import from the index: `import { Button } from '$lib/ui/primitives.js'`
- Use snippet syntax: `<Button>{content}</Button>` instead of slot syntax

### Example Template
```svelte
<script>
  import { Button } from '$lib/ui/primitives.js';
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Example Title</h1>
  
  <div class="card p-20up mb-20up">
    <p class="type-base-md mb-12bt">Description text</p>
    <Button>
      Action
    </Button>
  </div>
</div>

<!-- Only include if custom CSS is needed -->
<style src="./style.css"></style>
```

## Styling System & Tailwind CSS

### Critical: Design System Spacing Values

**IMPORTANT**: Only use spacing values that exist in the design system configuration. Invalid spacing utilities will cause build failures.

#### Available Viewport-Based Spacing (`up` suffix)
Valid values: `1up`, `2up`, `4up`, `5up`, `6up`, `10up`, `20up`, `30up`, `40up`, `50up`, `60up`, `70up`, `80up`, `90up`, `100up`, `120up`, `140up`, `160up`, `180up`, `200up`

#### Available Text-Based Spacing (`ut`, `bt`, `ht` suffixes)  
Valid values: `1ut/bt/ht`, `2ut/bt/ht`, `4ut/bt/ht`, `6ut/bt/ht`, `8ut/bt/ht`, `10ut/bt/ht`, `11ut/bt/ht`, `12ut/bt/ht`, `16ut/bt/ht`, `20ut/bt/ht`, `24ut/bt/ht`, `28ut/bt/ht`, `32ut/bt/ht`, `36ut/bt/ht`, `50ut/bt/ht`

#### ❌ Common Invalid Values (Will Cause Build Failures)
- `p-16up` (use `p-20up` instead)
- `px-16up py-12up` (use `px-20up py-10up` instead)
- `mb-16up` (use `mb-20up` instead)
- Any spacing value not listed above

### External CSS Files (`<style src="./style.css">`)

When using external CSS files with `@apply` directives, you **MUST** include the `@reference` directive:

#### ✅ Correct External CSS
```css
/* style.css */
@reference '../../app.css';

[data-page] {
  & .my-component {
    @apply p-20up bg-surface-300 border border-primary-500;
  }
}
```

#### ❌ Broken External CSS
```css
/* style.css - MISSING @reference */
[data-page] {
  & .my-component {
    @apply p-20up bg-surface-300; /* ERROR: Cannot apply unknown utility class */
  }
}
```

### Path Resolution for @reference

The `@reference` path must be relative to your CSS file's location:
- From `/src/routes/examples/style.css` → `@reference '../../app.css'`
- From `/src/routes/examples/ui/style.css` → `@reference '../../../app.css'`
- From `/src/lib/components/style.css` → `@reference '../../app.css'`

### Inline vs External CSS

#### Inline Styles (No @reference needed)
```svelte
<style>
  [data-page] {
    & .my-component {
      @apply p-20up bg-surface-300 border border-primary-500;
    }
  }
</style>
```

#### External CSS (Requires @reference)
```svelte
<!-- Component.svelte -->
<div class="my-component">Content</div>
<style src="./style.css"></style>
```

### Troubleshooting Build Errors

#### "Cannot apply unknown utility class 'p-XYZup'"
1. Check if the spacing value exists in `VIEWPORT_POINT_SIZES` or `TEXT_POINT_SIZES`
2. Replace with the nearest valid value (e.g., `16up` → `20up`)
3. If using external CSS, verify `@reference` directive is present and path is correct

#### "Are you using CSS modules or similar and missing @reference?"
1. Add `@reference '../../app.css'` at the top of your external CSS file
2. Verify the relative path from CSS file to `src/app.css` is correct
3. Consider switching to inline styles if path resolution is problematic

### Design System Integration

#### Always Use Design System Classes
- ✅ `type-heading-h1`, `type-base-md`, `type-ui-sm`
- ✅ `p-20up`, `m-10up`, `gap-16up` (viewport-based)
- ✅ `mb-16bt`, `mt-12ut` (text-based)
- ✅ `bg-surface-300`, `text-primary-500`, `border-error-500`
- ❌ Raw Tailwind: `text-lg`, `p-4`, `bg-gray-300`

#### Color System
All design system colors are available with contrast variants:
- Base colors: `bg-primary-500`, `bg-surface-100`, `bg-error-500`
- Contrast colors: `text-primary-contrast-500`, `text-surface-contrast-100`
- Shades: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

### CSS Architecture
- Use `[data-page]` scoping for page-specific styles
- Use `[data-component]` attributes for component identification  
- Prefer CSS nesting with `&` selector
- Layer styles: `@layer theme, base, utilities, components`

## What Not to Do
- Don't use deprecated Svelte 4 syntax
- Don't mix slot and snippet syntax
- Don't use TypeScript syntax
- Don't use CommonJS (require/module.exports)
- Don't use underscore prefixes for private methods
- Don't use invalid spacing values (e.g., `p-16up`, `mb-14up`) - check design system configuration
- Don't use external CSS with `@apply` without the `@reference` directive
- Don't modify unrelated code unless necessary
- **NEVER run `npm run dev` or `pnpm run dev`** - it interferes with the user's running development server
