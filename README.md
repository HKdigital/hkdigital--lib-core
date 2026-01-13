# HKdigital's lib-core

Core library that we use to power up our SvelteKit projects

This is a library for [SvelteKit](https://svelte.dev/) projects.
It contains common code, base components and documentation that help you with setting up a new project.

## Using the library

### Install

**For projects/applications:**
```bash
pnpm add @hkdigital/lib-core
```

**For other libraries:**
```bash
pnpm add -D --save-peer @hkdigital/lib-core
```

### Peer Dependencies

**For projects/applications**, install peer dependencies:
```bash
# Core framework and utilities
pnpm add @sveltejs/kit svelte svelte-preprocess runed valibot

# UI framework and components
pnpm add @skeletonlabs/skeleton

# UI icons
pnpm add @steeze-ui/heroicons

# CSS processing (Tailwind and PostCSS)
pnpm add tailwindcss @tailwindcss/postcss postcss autoprefixer

# Logging
pnpm add pino pino-pretty

# JWT authentication (if using auth features)
pnpm add jsonwebtoken

# Linting
pnpm add @eslint/js eslint-plugin-import

# Image processing
pnpm add -D vite-imagetools
```

**For other libraries**, install as dev dependencies and declare as peer dependencies:
```bash
# Install as dev dependencies and peer dependencies
pnpm add -D --save-peer @sveltejs/kit svelte svelte-preprocess runed valibot @skeletonlabs/skeleton @steeze-ui/heroicons tailwindcss @tailwindcss/postcss postcss autoprefixer pino pino-pretty jsonwebtoken @eslint/js eslint-plugin-import vite-imagetools
```

### Design System & Configuration

This library includes a complete design system with Tailwind CSS integration. Basic setup requires:

1. **Tailwind config** - Include library files in content scanning:
   ```js
   // tailwind.config.js
   import { 
     generateTailwindThemeExtensions,
     designTokens,
     customUtilitiesPlugin 
   } from '@hkdigital/lib-core/design/index.js';

   const themeExtensions = generateTailwindThemeExtensions(designTokens);

   /** @type {import('tailwindcss').Config} */
   export default {
     // Include @hkdigital libraries in content so Tailwind processes
     // their design system classes and components for proper styling
     content: [
       './node_modules/@hkdigital/**/*.{html,js,svelte}',
       './src/**/*.{html,js,svelte}'
     ],
     theme: {
       // Extend Tailwind's default theme using the design system tokens
       extend: themeExtensions
     },
     plugins: [
       // Generate custom utility classes like 'type-heading-h2'
       customUtilitiesPlugin
     ]
   };
   ```

2. **Design tokens** - Apply CSS variables in your layout:
   ```html
   <!-- src/routes/+layout.svelte -->
   <script>
     import { designTokens, designTokensToRootCssVars } from '@hkdigital/lib-core/design/index.js';
   </script>

   <svelte:head>
     {@html designTokensToRootCssVars(designTokens)}
   </svelte:head>

   {@render children()}
   ```

3. **Vite configuration** - Use the provided config generator:
   ```js
   // vite.config.js
   import { defineConfig } from 'vitest/config';
   import { generateViteConfig } from '@hkdigital/lib-core/config/vite.js';

   export default defineConfig(
     await generateViteConfig({
       enableImagetools: true,
       enableVitest: true
     })
   );
   ```

4. **Svelte configuration** - Configure preprocessing and useful path aliases:
   ```js
   // svelte.config.js
   import { sveltePreprocess } from 'svelte-preprocess';
   import adapter from '@sveltejs/adapter-auto';

   /** @type {import('@sveltejs/kit').Config} */
   const config = {
     // Enable preprocessing for external CSS files in Svelte components
     preprocess: sveltePreprocess({}),
     kit: {
       adapter: adapter(),
       alias: {
         $src: 'src',
         $examples: 'src/routes/examples'
       }
     }
   };

   export default config;
   ```

5. **Image import type definitions** - Add imagetools type support to
   `app.d.ts`:
   ```typescript
   // src/app.d.ts
   import '@hkdigital/lib-core/config/imagetools.d.ts';

   // See https://svelte.dev/docs/kit/types#app.d.ts
   // for information about these interfaces
   declare global {
     namespace App {
       // interface Error {}
       // interface Locals {}
       // interface PageData {}
       // interface PageState {}
       // interface Platform {}
     }
   }

   export {};
   ```

   **What this enables:**
   - Type definitions for image imports with query parameters (e.g., `hero.jpg?preset=photo`)
   - IntelliSense and autocompletion for imagetools directives in your editor
   - Prevents TypeScript errors when importing processed images
   - Works for both TypeScript and JavaScript projects (VS Code uses TypeScript for JS intellisense)

   **Available presets:**
   - `default` - AVIF format, 90% quality
   - `photo` - JPG format, 95% quality, returns metadata
   - `render` - JPG format, 95% quality, returns metadata
   - `gradient` - JPG format, 95% quality, returns metadata
   - `drawing` - AVIF format, 90% quality, returns metadata
   - `savedata` - AVIF format, 85% quality, returns metadata
   - `blur` - AVIF format, 50% quality with blur effect, returns metadata

   **Usage examples:**
   ```javascript
   // Basic usage
   import heroImage from '$lib/assets/hero.jpg?preset=photo';

   // Responsive images
   import heroResponsive from '$lib/assets/hero.jpg?preset=photo&responsive';
   ```

6. **(meta) folder setup** - Copy and configure PWA/favicon generation:

   The library includes a complete `(meta)` folder with PWA configuration,
   favicon generation, manifest.json, sitemap.xml, and robots.txt endpoints.

   **Copy the folder to your project:**
   ```bash
   cp -r node_modules/@hkdigital/lib-core/src/routes/\(meta\) src/routes/
   ```

   **Customize for your app:**
   - Replace `src/routes/(meta)/favicon.png` with your 512×512px image
   - Edit `src/routes/(meta)/config.js`:
     ```javascript
     export const name = 'Your App Name';
     export const shortName = 'App';
     export const description = 'Your app description';
     export const backgroundAndThemeColor = '#082962';

     // Add your site routes for sitemap
     export const siteRoutes = ['/', '/about', '/contact'];

     // Configure robots.txt (prevent test sites from being indexed)
     export const robotsConfig = {
       allowedHosts: ['mysite.com', 'www.mysite.com'],
       disallowedPaths: ['/admin/*'],
       includeSitemap: true
     };
     ```

   **Integrate into root layout:**
   ```svelte
   <!-- src/routes/+layout.svelte -->
   <script>
     import { Favicons, PWA } from './(meta)/index.js';
   </script>

   <Favicons />
   <PWA />

   {@render children()}
   ```

   **What you get:**
   - Automatic favicon generation (16, 32, 192, 512px)
   - Apple touch icons (120, 152, 167, 180px)
   - Dynamic `/manifest.json` endpoint
   - Dynamic `/sitemap.xml` endpoint
   - Dynamic `/robots.txt` with host filtering

   See [src/routes/(meta)/README.md](./src/routes/(meta)/README.md) for
   complete documentation.

### Logging System

The library includes a comprehensive logging system that provides:

- **Server-side**: Structured JSON logging with pino and beautiful terminal formatting via pino-pretty
- **Client-side**: Enhanced console logging with structured data display in browser inspector
- **Consistent API**: Same logging interface for both server and client environments
- **Tree-shaking optimized**: Separate entry points for client and server code ensure optimal bundle sizes

## Documentation

For detailed setup guides and configuration:
- **Project setup**: [docs/setup/new-project.md](./docs/setup/new-project.md) - SvelteKit project setup
- **Library setup**: [docs/setup/new-lib.md](./docs/setup/new-lib.md) - SvelteKit library setup
- **Services & logging**: [docs/setup/services-logging.md](./docs/setup/services-logging.md) - Service management architecture
- **Configuration files**: [docs/config/root-config-files.md](./docs/config/root-config-files.md) - Config file reference
- **Design system**: [src/lib/design/README.md](./src/lib/design/README.md) - Design tokens and theming
- **Vite configuration**: [src/lib/config/README.md](./src/lib/config/README.md) - Build configuration
- **Logging system**: [src/lib/logging/README.md](./src/lib/logging/README.md) - Server and client logging

### Update

Make sure your project has a script called `upgrade:hk` to upgrade all packages
in the '@hkdigital' namespace.

```bash
pnpm upgrade:hk
```

### Available scripts

```bash
pnpm run dev         # Start development server
pnpm run build       # Build the library
pnpm run check       # Type checking and validation
pnpm run test        # Run unit tests
pnpm run upgrade:hk  # Update all @hkdigital/... packages
pnpm run upgrade:all # Update all packages
pnpm run publish:npm # Version bump and publish to npm
```

### Import Validation

The library includes a validation script to enforce consistent import
patterns across both your project files and external `@hkdigital/*`
package imports.

**Add to your project's package.json:**

```json
{
  "scripts": {
    "lint:imports": "node node_modules/@hkdigital/lib-core/scripts/validate-imports.mjs"
  }
}
```

**Run validation:**

```bash
# Using npm script (recommended)
pnpm run lint:imports

# Or directly
node node_modules/@hkdigital/lib-core/scripts/validate-imports.mjs
```

**Validation rules (enforced for `src/lib/` files only):**

1. **Cross-domain imports** - Use `$lib/` instead of `../../../`
2. **Prefer barrel exports** - Use higher-level export files when available
3. **Parent index.js imports** - Use `$lib/` or import specific files
4. **Non-standard extensions** - Include full extension (e.g.,
   `.svelte.js`)
5. **Directory imports** - Write explicitly or create barrel export file
6. **File existence** - All import paths must resolve to existing files
7. **External package optimization** - Suggests barrel exports for
   `@hkdigital/*` packages

**Barrel export preference:**

The validator suggests using the highest-level barrel export file that
exports your target. This encourages shorter imports that can be
combined:

```js
// Internal imports - instead of deep imports:
import ProfileBlocks from '$lib/ui/components/profile-blocks/ProfileBlocks.svelte';
import Button from '$lib/ui/primitives/buttons/Button.svelte';

// Use barrel exports:
import { ProfileBlocks } from '$lib/ui/components.js';
import { Button } from '$lib/ui/primitives.js';

// External imports - instead of deep imports:
import { TextButton } from '@hkdigital/lib-core/ui/primitives/buttons/index.js';
import { TextInput } from '@hkdigital/lib-core/ui/primitives/inputs/index.js';

// Use barrel exports:
import { TextButton, TextInput } from '@hkdigital/lib-core/ui/primitives.js';
```

The validator checks from highest to lowest level (`$lib/ui.js` →
`$lib/ui/components.js` → `$lib/ui/components/profile-blocks.js`) and
suggests the highest-level file that exports your target. The same
logic applies to external `@hkdigital/*` packages.

**Routes are exempt from strict rules:**

Files in `src/routes/` can use relative imports freely, including parent
navigation and index.js imports. Since SvelteKit doesn't provide a
`$routes` alias, relative imports are the standard pattern for route
files.

**Example output:**

```
src/lib/ui/panels/Panel.svelte:6
  from '../../../components/profile-blocks/ProfileBlocks.svelte'
  => from '$lib/ui/components.js' (use barrel export)

src/lib/ui/pages/Profile.svelte:8
  from '$lib/ui/components/profile-blocks/ProfileBlocks.svelte'
  => from '$lib/ui/components.js' (use barrel export for shorter imports)

src/lib/forms/LoginForm.svelte:4
  from '@hkdigital/lib-core/ui/primitives/buttons/index.js'
  => from '@hkdigital/lib-core/ui/primitives.js' (use barrel export)

src/routes/explorer/[...path]/+page.svelte:4
  from '../components/index.js'
  ✅ Allowed in routes
```

**What gets checked for external packages:**

The validator only suggests barrel exports for:
- Explicit `index.js` imports
- Component files (`.svelte`)
- Class files (capitalized `.js` files)

Intentional imports like `helpers.js`, `config.js`, or other lowercase
utility files are assumed to be the public API and won't be flagged.

### Import Patterns and Export Structure

**Public exports use domain-specific files matching folder names:**

```js
// Standard pattern: folder → matching .js export file
import { httpGet, httpPost } from '@hkdigital/lib-core/network/http.js';
import { CacheManager } from '@hkdigital/lib-core/network/cache.js';
import { LCHAR } from '@hkdigital/lib-core/constants/regexp.js';
import { Button } from '@hkdigital/lib-core/ui/primitives.js';
```

**Pattern:**
- Folder `$lib/network/http/` → Export file `$lib/network/http.js`
- Folder `$lib/network/cache/` → Export file `$lib/network/cache.js`
- Folder `$lib/constants/regexp/` → Export file `$lib/constants/regexp.js`

**Rare exception - index.js for aggregated APIs:**

```js
// Only used for large subsystems with public-facing aggregated APIs
import { designTokens } from '@hkdigital/lib-core/design/index.js';
```

**TypeDefs for JSDoc:**

```js
/**
 * @param {import('@hkdigital/lib-core/network/typedef.js').HttpGetOptions}
 *   options
 */
function fetchData(options) {
  // ...
}
```

### CSS Architecture (app.css)

**CRITICAL**: Your `src/app.css` must include the complete design system
architecture. Incomplete imports will cause build failures.

**Required structure:**

```css
/* src/app.css */

/* 1. CSS Layers - Controls style precedence */
@layer theme, base, utilities, components;

/* 2. Tailwind CSS Core */
@import 'tailwindcss';

/* 3. HKdigital Design System Theme (ALL required for colors to work) */
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/theme.css' layer(theme);
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/globals.css';
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/components.css' layer(components);
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/responsive.css';

/* 4. Skeleton UI Framework */
@import '@skeletonlabs/skeleton' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');
@import '@skeletonlabs/skeleton/optional/presets' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');

/* 5. Tailwind Configuration Reference */
@config "../tailwind.config.js";

/* 6. Optional: Additional utilities */
/*@import '../node_modules/@hkdigital/lib-core/dist/css/utilities.css';*/
```

**Why all theme files are required:**
- Missing any theme file will cause "Cannot apply unknown utility class"
  errors
- Classes like `bg-surface-100`, `text-primary-500` won't work without
  complete theme
- All four theme files (theme.css, globals.css, components.css,
  responsive.css) are needed

See [src/lib/design/README.md](./src/lib/design/README.md) for complete
CSS architecture documentation.

### Critical: data-theme Attribute

**IMPORTANT**: Add `data-theme="hkdev"` to your `<body>` element in
`src/app.html`. Without this, theme colors will not work correctly.

```html
<!-- src/app.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-theme="hkdev" data-sveltekit-preload-data="hover">
    <div>%sveltekit.body%</div>
  </body>
</html>
```

**Why this is required:**
- Theme CSS custom properties are scoped to `[data-theme='hkdev']`
- Without this attribute, colors fall back to browser defaults
- **Symptom**: Colors like `bg-primary-500` show grey instead of magenta
- **Solution**: Add `data-theme="hkdev"` to `<body>` element

## Building the library

To build your library:

```bash
pnpm run package
```

## Running the showcase app

To use the showcase app that illustrates the code in this lib

```bash
pnpm run dev
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Developing

To develop this library, clone the repository and install the dependencies, then start the development server of the test runners. Checkout the [package.json](./package.json) file for more details.

Everything inside `src/lib` is part of the library, everything inside `src/routes` is the showcase app of this library.

## Publishing

The name of this library is `@hkdigital/lib-core` and it is published on [NPM](https://npmjs.com). You need NPM credentials to publish in the scope `@hkdigital`.

```bash
# Manually
npm login
npm version patch
npm publish --access public
```

```bash
# Run `npm version patch && npm publish --access public && git push`
# as specified in package.json
pnpm run publish:npm
```

### Troubleshooting

#### Running scripts from package.json in Windows

The CMD terminal in Windows is quite limited. Use the PowerShell instead of some scripts from package.json do not run correctly.


## Contribute

If your wish to contribute to this library, please contact us [HKdigital](https://hkdigital.nl/contact). Alternatively, the license permits you to fork the library and publish under an alternative name. Don't forget to change the package name in [package.json](./package.json) if you do so.

