# Setting Up a New Library Based on hkdigital--lib-core

This guide walks through setting up a new SvelteKit library that integrates with the hkdigital--lib-core design system and follows our established patterns.

**Essential Reading:**
- [Main README](../../README.md) - Overview and usage instructions
- [Design System README](../../src/lib/design/README.md) - Design tokens and theming
- [Config README](../../src/lib/config/README.md) - Vite and build configuration
- [Logging README](../../src/lib/logging/README.md) - Server and client logging setup

## Initial SvelteKit Library Setup

Start with the standard SvelteKit library creation process. See the official documentation: https://svelte.dev/docs/kit/creating-a-project

```bash
npx sv create company--lib-things
```

### Template Selection

When prompted, choose these options:

**Which template would you like?**
```
│  Svelte library
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
cd company--lib-things

git init
git add .
git commit -m "Initial SvelteKit library setup"
git remote add origin <repository-url>
git push origin main -u
```

### Install Dependencies

```bash
# After updating package.json with all dependencies, install everything
pnpm install
```

## Files to Create/Update for hkdigital--lib-core Integration

After the initial setup, modify/create these files to integrate with hkdigital--lib-core:

### Configuration Files

**1. `package.json` (UPDATE)**
- Update name from `"company--lib-things"` to `"@company/lib-things"` 
- Add complete scripts matching hkdigital--lib-core pattern using npm-run-all
- Add `@hkdigital/lib-core` to both peerDependencies and devDependencies
- Add all required peer dependencies: @skeletonlabs/skeleton, @steeze-ui/heroicons, pino, pino-pretty, runed, valibot, vite-imagetools
- Add comprehensive devDependencies list with build tools and utilities
- Add proper repository, author, and publishing configuration

**Required additional devDependencies for libraries:**
```bash
pnpm add -D npm-run-all npm-check-updates @sveltejs/package publint
```

**Complete scripts section for libraries:**
```json
{
  "scripts": {
    "dev": "run-s svelte:sync dev:start",
    "build": "run-s svelte:sync build:*",
    "preview": "vite preview",
    "check": "run-s svelte:sync check:run",
    "check:watch": "run-s svelte:sync check:watch-run",
    "format": "prettier --write .",
    "lint": "run-s lint:*",
    "test": "run-s test:unit-run",
    "prepack": "run-s prepack:*",
    "publish:npm": "run-s publish:npm:version publish:npm:publish git:push",
    "upgrade:hk": "run-s upgrade:hk:update pnpm:install",
    "upgrade:all": "run-s upgrade:all:update pnpm:install",
    "svelte:sync": "svelte-kit sync",
    "dev:start": "vite dev",
    "build:vite": "vite build",
    "check:run": "svelte-check --tsconfig ./jsconfig.json",
    "check:watch-run": "svelte-check --tsconfig ./jsconfig.json --watch",
    "git:push": "git push",
    "lint:prettier": "prettier --check .",
    "lint:eslint": "eslint .",
    "test:unit": "vitest",
    "test:unit-run": "pnpm run test:unit -- --run",
    "prepack:sync": "svelte-kit sync",
    "prepack:build": "svelte-package",
    "prepack:lint": "publint",
    "publish:npm:version": "npm version patch",
    "publish:npm:publish": "npm publish --access public",
    "upgrade:hk:update": "ncu --dep dev,optional,peer,prod '@hkdigital/*' -u",
    "upgrade:all:update": "ncu --dep dev,optional,peer,prod -u",
    "pnpm:install": "pnpm install"
  }
}
```

**Author and metadata for libraries:**
```json
{
  "name": "@company/lib-name",
  "description": "Library description",
  "private": true,
  "version": "0.0.1",
  "author": {
    "name": "HKdigital",
    "url": "https://hkdigital.nl"
  },
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-org/your-library.git"
  },
  "type": "module",
  "files": [
    "dist",
    "!dist/**/*.test.*",
    "!dist/**/*.spec.*"
  ],
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./*": "./dist/*"
  }
}
```

**NOTE**: Set `"private": false` and change license to `"ISC"` when ready to publish the library.

**2. `.gitignore` (CREATE)**
- Standard SvelteKit/Node.js gitignore patterns
- Should ignore node_modules, dist/, build artifacts, .env files, etc.

**3. `.prettierrc` (CREATE)**
- Code formatting configuration to match hkdigital--lib-core standards
- Likely includes Svelte and Tailwind CSS plugin configurations

**4. `.prettierignore` (CREATE)**
- Standard ignore patterns for prettier formatting
- Should exclude build artifacts and generated files

**5. `.env.example` (CREATE)**
- Empty template file for environment variables
- Good practice for library projects that might need env config

**6. `eslint.config.js` (UPDATE)**
- Currently exists but needs alignment with hkdigital--lib-core ESLint setup
- Should include Svelte 5 and modern JS linting rules

**7. `jsconfig.json` (UPDATE)**
- Currently exists but may need path aliases and compiler options updates
- Should match hkdigital--lib-core JavaScript project configuration

**8. `vite.config.js` (UPDATE)**
- Currently exists but needs integration with hkdigital--lib-core's vite config generator
- Should use `generateViteConfig()` with imagetools and testing enabled

**9. `claude.md` (CREATE)**
- Reference the claude.md file in `node_modules/@hkdigital/lib-core/claude.md` for base guidelines
- Add section for additional library-specific instructions (initially empty)
- This approach maintains consistency and avoids duplication

**10. `postcss.config.js` (CREATE)**
- Required for Tailwind CSS processing
- Should match hkdigital--lib-core configuration

**Example postcss.config.js:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

**11. `tailwind.config.js` (CREATE)**
- Integrate with hkdigital--lib-core design system
- Import design tokens and generate theme extensions
- Include content paths for both local and hkdigital library scanning
- **NOTE**: No Skeleton plugin needed - Skeleton is imported via CSS in app.css (Tailwind 4 architecture)

**12. `svelte.config.js` (UPDATE)**
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
      $src: 'src',
      $examples: 'src/routes/examples'
    }
  }
};

export default config;
```

### TypeScript & Source Files

**13. `src/app.html` (UPDATE)**
- **CRITICAL**: Add `data-theme="hkdev"` attribute to `<body>` element
- Without this, theme colors will not work correctly (primary-500 will show grey instead of magenta)
- This activates the CSS custom properties defined in the theme files

**Example src/app.html:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-theme="hkdev" data-sveltekit-preload-data="hover">
    <div>%sveltekit.body%</div>
  </body>
</html>
```

**14. `src/app.d.ts` (UPDATE)**
- Currently exists but needs hkdigital--lib-core imagetools type imports
- Should include `import '@hkdigital/lib-core/config/imagetools.d.ts';`

**15. `src/app.css` (UPDATE)**
- **NEW ARCHITECTURE**: With Tailwind 4, all framework imports are done via CSS, not Tailwind plugins
- Import complete CSS architecture including CSS layers, Skeleton UI, and theme system
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

**Key Changes from Previous Architecture:**
- **CSS Layers**: `@layer` system ensures proper style precedence
- **Skeleton Integration**: Imported via CSS, not Tailwind plugin
- **Complete Theme System**: Multiple theme files required (theme.css, globals.css, components.css, responsive.css)
- **@config Directive**: Links to Tailwind configuration file

**16. `src/hooks.server.js` (CREATE)**
- Set up server-side logging using hkdigital--lib-core logging system
- Configure pino logging for development and production

**17. `src/lib/index.js` (UPDATE)**
- Main library export file
- Currently minimal, should export actual library components

### Route Structure

**18. `src/routes/+layout.svelte` (UPDATE)**
- Add root CSS variables from hkdigital--lib-core design tokens
- Should include `designTokensToRootCssVars(designTokens)` in svelte:head

**19. `src/routes/+page.server.js` (CREATE)**
- Contains redirect logic to `/explorer`
- Server-side page load that redirects to the main showcase

**20. `src/routes/examples/` directory (CREATE)**
- Create with basic dummy example page structure
- Include `+layout.svelte`, `+page.svelte` for simple showcase examples

**21. `src/routes/explorer/` directory (COPY)**
- Copy entire explorer folder structure from hkdigital--lib-core
- Includes file system exploration functionality with components

## Key Integration Points

### Design System Integration
- Use hkdigital--lib-core design tokens in Tailwind config
- Import CSS utilities from hkdigital--lib-core
- Follow design system patterns for examples and showcase

### Build Process
- Use npm-run-all for consistent script execution
- Follow hkdigital--lib-core build pipeline patterns
- Include proper linting, testing, and packaging steps

### Development Experience
- Create claude.md that references `node_modules/@hkdigital/lib-core/claude.md` for base guidelines
- Set up proper TypeScript/JSDoc configuration
- Include comprehensive tooling setup (prettier, eslint, vitest)

### Library Structure
- Follow hkdigital--lib-core folder organization
- Include showcase/example routes for development
- Set up proper exports and peer dependencies

## References

- **Base template**: Use hkdigital--lib-core as the structural template
- **Design system**: Integrate with hkdigital--lib-core for styling and components
- **Documentation**: Follow patterns established in hkdigital--lib-core README
- **Standards**: Reference development guidelines from `@hkdigital/lib-core/claude.md`

## Verification

After completing the setup, verify everything works correctly:

```bash
# Install dependencies
pnpm install

# Verify development server starts
pnpm run dev
# Should start without errors and redirect to /explorer

# Verify linting passes
pnpm run lint
# Should pass without errors

# Verify type checking works
pnpm run check
# Should complete without TypeScript/JSDoc errors

# Verify build succeeds
pnpm run build
# Should build library successfully
```

## Troubleshooting

### Common Issues

**Missing peer dependencies error:**
```bash
# Install missing peer dependencies
pnpm add -D --save-peer [missing-package]
```

**Design tokens not loading:**
- Verify `src/routes/+layout.svelte` includes the design tokens import
- Check that `tailwind.config.js` imports from `@hkdigital/lib-core/design/index.js`
- Ensure CSS utilities are imported in `src/app.css`

**Build failures with Tailwind classes:**
- **Missing theme CSS**: Ensure `src/app.css` imports the theme CSS file that defines color variables
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

**Explorer not working:**
- Check that the explorer directory was copied completely
- Restart development server

This setup ensures your new library integrates seamlessly with the existing hkdigital ecosystem while maintaining consistent development practices and design system integration.
