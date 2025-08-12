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

# Logging
pnpm add pino pino-pretty

# Linting
pnpm add @eslint/js eslint-plugin-import

# Image processing
pnpm add vite-imagetools
```

**For other libraries**, install as dev dependencies and declare as peer dependencies:
```bash
# Install as dev dependencies and peer dependencies
pnpm add -D --save-peer @sveltejs/kit svelte svelte-preprocess runed valibot @skeletonlabs/skeleton @steeze-ui/heroicons pino pino-pretty @eslint/js eslint-plugin-import vite-imagetools
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

### Logging System

The library includes a comprehensive logging system that provides:

- **Server-side**: Structured JSON logging with pino and beautiful terminal formatting via pino-pretty
- **Client-side**: Enhanced console logging with structured data display in browser inspector
- **Consistent API**: Same logging interface for both server and client environments

For detailed setup guides see:
- **Design system**: [src/lib/design/README.md](./src/lib/design/README.md)
- **Vite configuration**: [src/lib/config/README.md](./src/lib/config/README.md)
- **Logging system**: [src/lib/logging/README.md](./src/lib/logging/README.md)

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

### Import JS, Svelte files and Typedefs

Main folders in lib have an index.js, but may also have a more specific export file e.g. http.js or cache.js (@see $lib/network).

Main folders (should) have a typedef.js that can be used in JSdoc comments.

```js
// Import Latin char constant for use in regular expressions
import { LCHAR } from '@hkdigital/lib-core/constants/regexp/index.js';
```

```js
/**
 * @param {import('@hkdigital/lib-core/network/typedef.js').JsonGetOptions} JsonGetOptions
 */
```

### Import CSS

Vite should include postcss-import, but the only solution to get it working for now is to use a relative path to the node_modules folder.

For example:

```css
/* src/app.css */
@import '../node_modules/@hkdigital/lib-core/dist/css/utilities.css';
```

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

