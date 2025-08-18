# Setting Up a New Project Based on hkdigital--lib-core

This guide walks through setting up a new SvelteKit project/application that integrates with the hkdigital--lib-core design system and follows our established patterns.

**Essential Reading:**
- [Main README](./README.md) - Overview and usage instructions
- [Design System README](./src/lib/design/README.md) - Design tokens and theming
- [Config README](./src/lib/config/README.md) - Vite and build configuration
- [Logging README](./src/lib/logging/README.md) - Server and client logging setup

## Initial SvelteKit Project Setup

Start with the standard SvelteKit project creation process. See the official documentation: https://svelte.dev/docs/kit/creating-a-project

```bash
npx sv create my-awesome-project
```

### Template Selection

When prompted, choose these options:

**Which template would you like?**
```
│  ● SvelteKit minimal (barebones scaffolding for your new app)
```

**Add type checking with TypeScript?**
```
│  ● Yes, using JavaScript with JSDoc comments
```

**What would you like to add to your project?**
```
│  ◼ prettier (formatter - https://prettier.io)
│  ◼ eslint (linter - https://eslint.org)
│  ◼ vitest (unit testing - https://vitest.dev)
│  ◼ tailwindcss (css framework - https://tailwindcss.com)
│  ◼ sveltekit-adapter (deployment - https://svelte.dev/docs/kit/adapters)
```

**vitest: What do you want to use vitest for?**
```
│  ◼ unit testing
│  ◼ component testing
```

**tailwindcss: Which plugins would you like to add?**
```
│  ◻ typography (@tailwindcss/typography)  ← Skip
│  ◻ forms                                 ← Skip
```

**Which package manager do you want to install dependencies with?**
```
│  ● pnpm
```

### Initial Git Setup

```bash
cd my-awesome-project

git init
git add .
git commit -m "Initial SvelteKit project setup"
git remote add origin <repository-url>
git push origin main -u
```

## Install hkdigital--lib-core Dependencies

**Key Difference from Library Setup**: For projects/applications, install all dependencies as regular dependencies, not peer dependencies.

### Core Library

```bash
# Install the core library
pnpm add @hkdigital/lib-core
```

### Required Dependencies

Install all required dependencies as regular dependencies:

```bash
# Core framework and utilities (if not already installed)
pnpm add @sveltejs/kit svelte svelte-preprocess runed valibot

# UI framework and components
pnpm add @skeletonlabs/skeleton

# UI icons
pnpm add @steeze-ui/heroicons

# Logging
pnpm add pino pino-pretty

# Linting (add to devDependencies)
pnpm add -D @eslint/js eslint-plugin-import

# Image processing (add to devDependencies)
pnpm add -D vite-imagetools
```

## Files to Create/Update for hkdigital--lib-core Integration

### Configuration Files

**1. `package.json` (UPDATE)**
- Update scripts to include development and production commands using npm-run-all
- Add proper repository, author, and publishing configuration
- **NOTE**: Unlike libraries, dependencies are regular dependencies, not peer dependencies

**Required additional devDependencies:**
```bash
pnpm add -D npm-run-all npm-check-updates
```

**Complete scripts section:**
```json
{
  "scripts": {
    "dev": "run-s svelte:sync dev:start",
    "build": "run-s svelte:sync build:vite",
    "preview": "vite preview",
    "check": "run-s svelte:sync check:run",
    "check:watch": "run-s svelte:sync check:watch-run",
    "format": "prettier --write .",
    "lint": "run-s lint:*",
    "test": "run-s test:unit-run",
    "upgrade:hk": "run-s upgrade:hk:update pnpm:install",
    "upgrade:all": "run-s upgrade:all:update pnpm:install",
    "svelte:sync": "svelte-kit sync",
    "dev:start": "vite dev",
    "build:vite": "vite build",
    "check:run": "svelte-check --tsconfig ./jsconfig.json",
    "check:watch-run": "svelte-check --tsconfig ./jsconfig.json --watch",
    "lint:prettier": "prettier --check .",
    "lint:eslint": "eslint .",
    "test:unit": "vitest",
    "test:unit-run": "pnpm run test:unit -- --run",
    "upgrade:hk:update": "ncu --dep dev,optional,peer,prod '@hkdigital/*' -u",
    "upgrade:all:update": "ncu --dep dev,optional,peer,prod -u",
    "pnpm:install": "pnpm install"
  }
}
```

**Author and metadata:**
```json
{
  "name": "your-project-name",
  "description": "Project description",
  "private": true,
  "version": "0.0.1",
  "author": {
    "name": "HKdigital",
    "url": "https://hkdigital.nl"
  },
  "license": "UNLICENSED",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-org/your-project.git"
  }
}
```

**2. `.gitignore` (EXISTS)**
- Should already have standard SvelteKit/Node.js gitignore patterns
- Verify it includes node_modules, .svelte-kit/, build artifacts, .env files, etc.

**3. `.prettierrc` (EXISTS)**
- Should already exist from SvelteKit template
- Verify it includes Svelte formatting configuration

**4. `.prettierignore` (EXISTS)**
- Should already exist from SvelteKit template

**5. `.env.example` (CREATE)**
- Template file for environment variables your project needs
- Good practice for projects that use environment configuration

**6. `eslint.config.js` (UPDATE)**
- Currently exists but needs alignment with hkdigital--lib-core ESLint setup
- Should include Svelte 5 and modern JS linting rules

**7. `jsconfig.json` (UPDATE)**
- Currently exists but may need path aliases and compiler options updates
- Should match hkdigital--lib-core JavaScript project configuration

**8. `vite.config.js` (UPDATE)**
- Currently exists but needs integration with hkdigital--lib-core's vite config generator
- Should use `generateViteConfig()` with imagetools and testing enabled

**Example vite.config.js:**
```js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { generateViteConfig } from '@hkdigital/lib-core/config/vite.js';

export default defineConfig(
  await generateViteConfig({
    enableImagetools: true,
    enableVitest: true,
    enableSvelteKit: true
  })
);
```

**9. `postcss.config.js` (CREATE/UPDATE)**
- May exist from Tailwind template, ensure it matches hkdigital--lib-core configuration
- Required for Tailwind CSS processing

**Example postcss.config.js:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

**10. `tailwind.config.js` (UPDATE)**
- Replace template config with hkdigital--lib-core design system integration
- Import design tokens and generate theme extensions
- Include content paths for both local and hkdigital library scanning
- **NOTE**: No Skeleton plugin needed - Skeleton is imported via CSS in app.css (Tailwind 4 architecture)

**Example tailwind.config.js:**
```js
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

**11. `svelte.config.js` (UPDATE)**
- Add alias for convenient hkdigital--lib-core imports (optional but recommended)
- **IMPORTANT**: Add `sveltePreprocess({})` for proper preprocessing
- Configure adapter and other settings

**Example svelte.config.js:**
```js
import adapter from '@sveltejs/adapter-auto';
import { sveltePreprocess } from 'svelte-preprocess';

const config = {
  preprocess: sveltePreprocess({}), // ← REQUIRED for preprocessing
  kit: {
    adapter: adapter(),
    alias: {
      // Optional: convenient alias for hkdigital imports
      '$hklib': 'node_modules/@hkdigital/lib-core/dist'
    }
  }
};

export default config;
```

### TypeScript & Source Files

**12. `src/app.html` (UPDATE)**
- **CRITICAL**: Add `data-theme="hkdev"` attribute to `<body>` element
- Without this, theme colors will not work correctly (primary-500 will show grey instead of magenta)
- This activates the CSS custom properties defined in the theme files

**Example src/app.html:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-theme="hkdev" data-sveltekit-preload-data="hover">
    <div>%sveltekit.body%</div>
  </body>
</html>
```

**13. `src/app.d.ts` (UPDATE)**
- Add hkdigital--lib-core imagetools type imports for proper TypeScript/JSDoc support
- Should include `import '@hkdigital/lib-core/config/imagetools.d.ts';`

**14. `src/app.css` (UPDATE)**
- **NEW ARCHITECTURE**: With Tailwind 4, all framework imports are done via CSS, not Tailwind plugins
- Replace template CSS with complete CSS architecture including CSS layers, Skeleton UI, and theme system
- **CRITICAL**: This replaces the old plugin-based approach - Skeleton is now imported here, not in tailwind.config.js
- **REQUIRED**: All theme files must be imported for color classes like `bg-surface-100` to work

**Complete src/app.css structure:**
```css
/* Layers decide what css goes first */
@layer theme, base, utilities, components;

/* Insert tailwind classes and styles */
@import 'tailwindcss';

/* Import theme classes and styles */
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/theme.css' layer(theme);
/*@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/debug.css';*/
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/globals.css';
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/components.css' layer(components);
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/responsive.css';

/* Import Skeleton UI framework */
@import '@skeletonlabs/skeleton' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');
@import '@skeletonlabs/skeleton/optional/presets' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');

/* Reference Tailwind configuration */
@config "../tailwind.config.js";

/* Optional HKdigital utilities */
/*@import '../node_modules/@hkdigital/lib-core/dist/css/utilities.css';*/
```

**Key Changes from Template CSS:**
- **CSS Layers**: `@layer` system ensures proper style precedence
- **Skeleton Integration**: Imported via CSS, not Tailwind plugin
- **Complete Theme System**: Multiple theme files required (theme.css, globals.css, components.css, responsive.css)
- **@config Directive**: Links to Tailwind configuration file

**15. `src/hooks.server.js` (CREATE)**
- Set up server-side logging using hkdigital--lib-core logging system
- Configure pino logging for development and production

### Route Structure

**16. `src/routes/+layout.svelte` (UPDATE)**
- Add root CSS variables from hkdigital--lib-core design tokens
- Should include `designTokensToRootCssVars(designTokens)` in svelte:head
- Replace template layout with hkdigital integration

**Example +layout.svelte:**
```svelte
<script>
  import '../app.css';
  import { designTokens, designTokensToRootCssVars } from '@hkdigital/lib-core/design/index.js';

  let { children } = $props();
</script>

<svelte:head>
  {@html designTokensToRootCssVars(designTokens)}
</svelte:head>

{@render children()}
```

**17. `src/routes/+page.svelte` (UPDATE)**
- Replace template homepage with your project's content
- Use design system classes and components from hkdigital--lib-core
- Follow design system patterns for consistent styling

## Key Integration Points

### Design System Integration
- Use hkdigital--lib-core design tokens in Tailwind config
- Import complete CSS architecture from hkdigital--lib-core
- Follow design system patterns for consistent styling across your application

### Build Process
- Use hkdigital--lib-core's Vite configuration generator
- Include proper linting, testing, and build optimization

### Development Experience
- Set up proper TypeScript/JSDoc configuration with hkdigital imports
- Include comprehensive tooling setup (prettier, eslint, vitest)
- Follow hkdigital development patterns and conventions

### Dependency Management
- **Key Difference**: Install all dependencies as regular dependencies (not peer dependencies like libraries)
- This ensures your application has direct control over dependency versions
- Peer dependencies are only used when creating libraries that will be consumed by other projects

## References

- **Base patterns**: Use hkdigital--lib-core established patterns and components
- **Design system**: Integrate with hkdigital--lib-core for styling and components
- **Documentation**: Follow patterns established in hkdigital--lib-core README and examples

## Verification

After completing the setup, verify everything works correctly:

```bash
# Install dependencies
pnpm install

# Verify development server starts
pnpm run dev
# Should start without errors and display your application

# Verify linting passes
pnpm run lint
# Should pass without errors

# Verify type checking works
pnpm run check
# Should complete without TypeScript/JSDoc errors

# Verify build succeeds
pnpm run build
# Should build application successfully

# Verify preview works
pnpm run preview
# Should serve the built application
```

## Troubleshooting

### Common Issues

**Missing dependencies error:**
```bash
# Install missing dependencies as regular dependencies
pnpm add [missing-package]
```

**Design tokens not loading:**
- Verify `src/routes/+layout.svelte` includes the design tokens import
- Check that `tailwind.config.js` imports from `@hkdigital/lib-core/design/index.js`
- Ensure complete CSS architecture is imported in `src/app.css`

**Build failures with Tailwind classes:**
- **Missing theme CSS**: Ensure `src/app.css` imports the complete theme system
- Check that only valid design system spacing values are used
- Verify all `@apply` directives in external CSS include `@reference` directive
- Use design system classes instead of raw Tailwind classes

**"Cannot apply unknown utility class 'bg-surface-100'" error:**
- This means the complete theme system is not imported - add ALL theme imports to `src/app.css`
- Verify you have the complete app.css structure with CSS layers, Skeleton imports, and multiple theme files
- The minimal theme.css import is not sufficient - you need globals.css, components.css, and responsive.css too
- **SOLUTION**: Use the complete app.css structure provided above, not just the theme.css import

**Theme colors showing grey instead of correct colors (e.g. primary-500 grey instead of magenta):**
- Missing `data-theme="hkdev"` attribute on `<body>` element in `src/app.html`
- Theme CSS custom properties are scoped to `[data-theme='hkdev']` selector
- Without the data attribute, the theme variables aren't activated and colors fall back to browser defaults
- **SOLUTION**: Add `data-theme="hkdev"` to your `<body>` element in `src/app.html`

**Vite configuration issues:**
- Verify you're using `generateViteConfig()` from `@hkdigital/lib-core/config/vite.js`
- Check that imagetools is installed as a dev dependency if `enableImagetools: true`
- Restart the development server after configuration changes

This setup ensures your new project integrates seamlessly with the hkdigital ecosystem while maintaining consistent development practices and design system integration.
