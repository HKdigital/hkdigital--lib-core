# HKdigital Design System

A comprehensive, responsive design system built for SvelteKit applications. This system provides consistent scaling, typography, spacing, and theming across all screen sizes using CSS custom properties and Tailwind CSS.

## Quick Start

### Basic Usage

**1. Import theme CSS in your app.css (REQUIRED for color classes):**
```css
/* src/app.css */
@import 'tailwindcss';
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/theme.css';
@import '../node_modules/@hkdigital/lib-core/dist/css/utilities.css';
```

**2. Configure Tailwind:**
```javascript
// tailwind.config.js
import { 
  generateTailwindThemeExtensions,
  designTokens,
  customUtilitiesPlugin 
} from '@hkdigital/lib-core/design/index.js';

const themeExtensions = generateTailwindThemeExtensions(designTokens);

/** @type {import('tailwindcss').Config} \*/
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

**3. Add design tokens to your layout:**
```html
<!-- +layout.svelte -->
<script>
  import { designTokens, designTokensToRootCssVars } from '@hkdigital/lib-core/design/index.js';
</script>

<svelte:head>
  {@html designTokensToRootCssVars(designTokens)}
</svelte:head>

{@render children()}
```

**⚠️ Important:** Without the theme CSS import, color classes like `bg-surface-100`, `text-primary-500`, etc. will fail with "Cannot apply unknown utility class" errors during build.

## CSS Architecture & app.css

### Overview

The design system is orchestrated through `src/app.css`, which serves as the central CSS coordination file. Understanding its structure is essential for proper integration and troubleshooting.

### app.css Structure

When using this design system in your project, your `src/app.css` should follow this structure:

```css
/* your-project/src/app.css */

/* 1. CSS Layers - Controls style precedence */
@layer theme, base, utilities, components;

/* 2. Tailwind CSS Core */
@import 'tailwindcss';

/* 3. HKdigital Design System Theme */
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/theme.css' layer(theme);
/*@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/debug.css';*/
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/globals.css';
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/components.css' layer(components);
@import '../node_modules/@hkdigital/lib-core/dist/design/themes/hkdev/responsive.css';

/* 4. Skeleton UI Framework */
@import '@skeletonlabs/skeleton' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');
@import '@skeletonlabs/skeleton/optional/presets' source('../node_modules/@skeletonlabs/skeleton-svelte/dist');

/* 5. Tailwind Configuration Reference */
@config "../tailwind.config.js";

/* 6. Optional HKdigital Utilities */
/*@import '../node_modules/@hkdigital/lib-core/dist/css/utilities.css';*/

/* 7. Optional Project-specific CSS */
/*@import './css/custom.css';*/

/* 8. Optional Font Imports */
/*@import url(/fonts/unbounded/unbounded.css);
@import url(/fonts/mulish/mulish.css);*/
```

**Available Optional Imports**:
- **Debug styles**: `debug.css` - Development debugging helpers
- **Additional utilities**: `utilities.css` - Extra utility classes beyond Tailwind
- **Custom fonts**: Project-specific typography files

**Path Structure**: All HKdigital lib-core imports use the `../node_modules/@hkdigital/lib-core/dist/` prefix for consuming projects.

### CSS Layer System

The `@layer` directive ensures proper style precedence:

1. **theme**: Design system color tokens and CSS variables
2. **base**: Reset styles, typography defaults
3. **utilities**: Tailwind utility classes (spacing, colors, etc.)
4. **components**: Component-specific styling

This layering prevents style conflicts and ensures predictable cascade behavior.

### Key Roles

**Central Reference Point**:
- External CSS files use `@reference '../../app.css'` to access design system utilities
- Provides single source of truth for all CSS dependencies

**Design System Integration**:
- Loads theme CSS files that define design tokens as CSS custom properties
- Integrates with `tailwind.config.js` via `@config` directive
- Enables responsive scaling system through imported theme files

**Framework Coordination**:
- Combines Tailwind CSS utilities with Skeleton UI components
- Manages style precedence through layer system
- Ensures consistent styling across the entire application

### Common Integration Points

**In SvelteKit Layout**:
```javascript
// src/routes/+layout.svelte
import '../app.css';  // Loads entire design system
```

**In Tailwind Config**:
```javascript
// tailwind.config.js
// References app.css through @config directive
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  // ... theme extensions from design tokens
};
```

**For External CSS**:
```css
/* any-external-file.css */
@reference '../../app.css';  /* Path to app.css */

.my-component {
  @apply p-20up bg-surface-300;  /* Now accessible */
}
```

### Troubleshooting

**Build Errors with External CSS**:
- Missing `@reference` directive → Add `@reference` with correct path to app.css
- Wrong path in `@reference` → Verify relative path from CSS file to `src/app.css`

**Style Precedence Issues**:
- Custom styles being overridden → Check CSS layer placement
- Theme variables not available → Ensure proper import order in app.css

**Design System Classes Not Working**:
- Classes not generated → Verify `tailwind.config.js` references correct design tokens
- CSS custom properties missing → Check theme files are properly imported

## Using Design System Classes in External CSS

When using design system utilities like `p-16up`, `bg-surface-300`, or `border-primary-500` in external CSS files (loaded via `<style src="./style.css"></style>`), you **must** include the `@reference` directive at the top of your CSS file.

**SVELTE preprocess**
You need svelte preprocess to process external CSS files in your svelte files!

```html
<div data-page>
  <p>Hello there!</p>
</div>

<style src="./style.css"></style>
```

### ✅ Correct Usage

```css
/* style.css */
@reference '../../app.css';

[data-page] {
  & .my-component {
    @apply p-16up bg-surface-300 border border-primary-500;
  }
}
```

### ❌ Common Mistake

```css
/* style.css - MISSING @reference directive */
[data-page] {
  & .my-component {
    @apply p-16up bg-surface-300; /* ERROR: Cannot apply unknown utility class */
  }
}
```

### Path Resolution

The `@reference` path must be relative to your CSS file's location:

E.g. `/src/routes/examples/style.css` → `@reference '../../app.css'`

```svelte
<style>
  [data-page] {
    & .my-component {
      @apply p-16up bg-surface-300 border border-primary-500;
    }
  }
</style>
```

### Troubleshooting

If you see errors like:
- `Cannot apply unknown utility class 'p-16up'`
- `Cannot apply unknown utility class 'bg-surface-300'`
- `Are you using CSS modules or similar and missing @reference?`

**Solution**: Add `@reference` directive with the correct relative path to your `app.css` file.

## Core Concepts

### Responsive Scaling System

The design system is built around a **1024×768 design reference** that automatically scales to any screen size with sensible minimum and maximum bounds.

#### CSS Variables Created:
- `--scale-ui`: Clamped UI scaling (0.3× to 2×)
- `--scale-text-base`: Base text scaling (0.75× to 1.5×)
- `--scale-text-heading`: Heading text scaling (0.75× to 2.25×)
- `--scale-text-ui`: UI text scaling (0.5× to 1.25×)

## Spacing Classes

### UI Points
**Primary method for UI element spacing:**

```html
<div class="p-20up m-10up">
  <!-- 20px padding, 10px margin at design size -->
  <!-- Automatically scales with viewport -->
</div>
```

Available: `1up`, `2up`, `4up`, `5up`, `6up`, `10up`, `20up`, `30up`, `40up`, `50up`, `60up`, `70up`, `80up`, `90up`, `100up`, `120up`, `140up`, `160up`, `180up`, `200up`

### Text-Based Spacing
**For spacing relative to text size:**

```html
<div class="mb-16bt">     <!-- Base text spacing -->
<div class="p-12ut">      <!-- UI text spacing -->
<div class="mt-24ht">     <!-- Heading text spacing -->
```

Available for all text point sizes: `1ut/bt/ht`, `2ut/bt/ht`, `4ut/bt/ht`, `6ut/bt/ht`, `8ut/bt/ht`, `10ut/bt/ht`, `11ut/bt/ht`, `12ut/bt/ht`, `16ut/bt/ht`, `20ut/bt/ht`, `24ut/bt/ht`, `28ut/bt/ht`, `32ut/bt/ht`, `36ut/bt/ht`, `50ut/bt/ht`

### Alternative Viewport Units
```html
<div class="w-100wp h-50hp">  <!-- Width/height points -->
```

## Typography Classes

### Complete Typography Styles
**Use `type-` classes for complete text styling:**

```html
<h1 class="type-heading-h1">Main Title</h1>
<h2 class="type-heading-h2">Section Title</h2>
<h3 class="type-heading-h3">Subsection</h3>
<p class="type-base-md">Body paragraph text</p>
<span class="type-ui-sm">Interface text</span>

<!-- Dark mode variants -->
<h1 class="type-heading-h1-dark">Dark mode title</h1>
<p class="type-base-md-dark">Dark mode paragraph</p>
```

**Available Typography Classes:**
- **Headings**: `type-heading-h1`, `type-heading-h2`, `type-heading-h3`, `type-heading-h4`, `type-heading-h5`
- **Body Text**: `type-base-sm`, `type-base-md`, `type-base-lg`
- **UI Text**: `type-ui-sm`, `type-ui-md`, `type-ui-lg`
- **Dark Variants**: Add `-dark` suffix to any class

### Font Size Only
**Use `text-` classes for font size only:**

```html
<p class="text-base-md">16px scaled base text</p>
<h2 class="text-heading-h2">28px scaled heading</h2>
```

## Border & Radius Classes

### Border Radius
```html
<div class="rounded-xs">    <!-- 5px scaled -->
<div class="rounded-sm">    <!-- 10px scaled -->
<div class="rounded-md">    <!-- 25px scaled -->
<div class="rounded-lg">    <!-- 35px scaled -->
<div class="rounded-none">  <!-- 0px -->
<div class="rounded-full">  <!-- 9999px -->
```

### Border & Stroke Width
```html
<div class="border-width-thin">    <!-- 1px scaled -->
<div class="border-width-normal">  <!-- 2px scaled -->
<div class="border-width-thick">   <!-- 4px scaled -->

<svg class="stroke-normal">        <!-- 2px scaled stroke -->
<div class="outline-thick">        <!-- 4px scaled outline -->
```

## Colors (Theme hkdev)

### Brand Colors
```html
<div class="bg-primary-500 text-primary-contrast-500">
<div class="bg-secondary-600 text-secondary-contrast-600">
<div class="bg-tertiary-400 text-tertiary-contrast-400">
```

### Surface Colors (Neutrals)
```html
<div class="bg-surface-50">   <!-- Lightest -->
<div class="bg-surface-500">  <!-- Medium -->
<div class="bg-surface-950">  <!-- Darkest -->
```

### Status Colors
```html
<div class="bg-success-500 text-success-contrast-500">
<div class="bg-warning-500 text-warning-contrast-500">
<div class="bg-error-500 text-error-contrast-500">
```

**Auto Contrast**: Each color includes automatic contrast colors for accessibility. Use `text-{color}-contrast-{shade}` for optimal readability.

**Skeleton**
This library is based on both Tailwind and Skeleton. See [Skeleton Design Colors](https://www.skeleton.dev/docs/design/colors).

## Component Styling

Components use `data-` attributes with CSS custom properties:

```html
<button data-component="button" data-role="primary">
  Primary Button
</button>

<button data-component="button" data-role="secondary">
  Secondary Button
</button>
```

## Utility Functions

### CSS Variable Utilities

```javascript
import { 
  getRootCssDesignWidth,
  getRootCssDesignHeight,
  getAllRootScalingVars
} from '@hkdigital/lib-core/design/index.js';

// Get current design dimensions
const designWidth = getRootCssDesignWidth();   // 1024
const designHeight = getRootCssDesignHeight(); // 768

// Get all current scaling factors
const scales = getAllRootScalingVars();
// Returns: { scaleW, scaleH, scaleViewport, scaleUI, scaleTextBase, scaleTextHeading, scaleTextUI }
```

### Clamp Utilities

```javascript
import { clamp, getClampParams } from '@hkdigital/lib-core/design/index.js';

// Mathematical clamp function
const value = clamp(0.5, 0.3, 2.0); // Returns 0.5 (clamped between 0.5 and 2.0)

// Extract clamp parameters from CSS variables
const params = getClampParams('scale-ui');
// Returns: { min: 0.3, max: 2.0 }
```

### Component State Classes

```javascript
import { toStateClasses } from '@hkdigital/lib-core/design/index.js';

// Generate state classes from object
const classes = toStateClasses({
  selected: true,
  loading: false,
  error: true,
  disabled: false
});
// Returns: "state-selected state-error"
```

```html
<!-- Usage in components -->
<button class={toStateClasses({ selected, disabled, loading })}>
  Button Text
</button>
```

### Responsive Scaling

#### Viewport-Based Scaling

```javascript
import { enableScalingUI, designTokens } from '@hkdigital/lib-core/design/index.js';

// Enable automatic viewport scaling
const cleanup = enableScalingUI(designTokens.DESIGN, designTokens.CLAMPING);

// Call cleanup when component is destroyed
onDestroy(cleanup);
```

#### Container-Based Scaling

```javascript
import { enableContainerScaling, designTokens } from '@hkdigital/lib-core/design/index.js';

let containerElement;

// Enable scaling for specific container
const cleanup = enableContainerScaling({
  container: containerElement,
  design: designTokens.DESIGN,
  clamping: designTokens.CLAMPING,
  useResizeObserver: true
});

// Optional custom dimension getter
const cleanupCustom = enableContainerScaling({
  container: containerElement,
  design: designTokens.DESIGN,
  clamping: designTokens.CLAMPING,
  getDimensions: () => ({ width: 800, height: 600 })
});
```

```svelte
<!-- Svelte component example -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { enableContainerScaling, designTokens } from '@hkdigital/lib-core/design/index.js';
  
  let containerElement;
  let cleanup;
  
  onMount(() => {
    cleanup = enableContainerScaling({
      container: containerElement,
      design: designTokens.DESIGN,
      clamping: designTokens.CLAMPING
    });
  });
  
  onDestroy(() => {
    cleanup?.();
  });
</script>

<div bind:this={containerElement} class="scaled-container">
  <!-- Content that scales with container -->
  <div class="p-20up text-base-md">Responsive content</div>
</div>
```

## Advanced Usage

### Custom Design Configuration

```javascript
// your-project/src/lib/design/design-tokens.js
export const designTokens = {
  DESIGN: {
    width: 1440,
    height: 900
  },

  CLAMPING: {
    ui: { min: 0.4, max: 1.8 },
    textBase: { min: 0.8, max: 1.4 },
    textHeading: { min: 0.8, max: 2.0 },
    textUi: { min: 0.6, max: 1.2 }
  },

  TEXT_POINT_SIZES: [4, 8, 12, 16, 20, 24, 32],
  VIEWPORT_POINT_SIZES: [10, 20, 30, 40, 50, 100, 200],

  TEXT_BASE_SIZES: {
    sm: { size: 12, lineHeight: 1.4 },
    md: { size: 16, lineHeight: 1.4 },
    lg: { size: 20, lineHeight: 1.4 }
  },

  TEXT_HEADING_SIZES: {
    h1: { size: 36, lineHeight: 1.2 },
    h2: { size: 30, lineHeight: 1.2 },
    h3: { size: 26, lineHeight: 1.2 }
  },

  TEXT_UI_SIZES: {
    sm: { size: 12, lineHeight: 1.2 },
    md: { size: 14, lineHeight: 1.2 },
    lg: { size: 16, lineHeight: 1.2 }
  },

  RADIUS_SIZES: {
    none: '0px',
    sm: { size: 8 },
    md: { size: 16 },
    lg: { size: 24 },
    full: '9999px'
  },

  BORDER_WIDTH_SIZES: {
    thin: { size: 1 },
    normal: { size: 2 },
    thick: { size: 3 }
  },

  STROKE_WIDTH_SIZES: {
    thin: { size: 1 },
    normal: { size: 2 },
    thick: { size: 3 }
  }
};

// your-project/tailwind.config.js
import { generateTailwindThemeExtensions, customUtilitiesPlugin } from '@hkdigital/lib-core/design/index.js';
import { designTokens } from './src/lib/design/design-tokens.js';

const themeExtensions = generateTailwindThemeExtensions(designTokens);

export default {
  theme: {
    extend: themeExtensions
  },
  plugins: [customUtilitiesPlugin]
};
```

### Available Generator Functions

Individual generator functions are available for advanced customization:

```javascript
import {
  generateTailwindThemeExtensions, // Complete theme extension generator
  generateTextBasedSpacing,        // ut/bt/ht spacing units
  generateViewportBasedSpacing,    // up/wp/hp spacing units
  generateTextStyles,              // Complete typography styles
  generateBorderRadiusStyles,      // Border radius with scaling
  generateWidthStyles              // Border/stroke width with scaling
} from '@hkdigital/lib-core/design/index.js';

// Example: Generate only spacing for a custom configuration
const customSpacing = generateTextBasedSpacing([4, 8, 12, 16, 24]);
```

### Default Design Tokens

The default design tokens are available for reference or as a starting point:

```javascript
import { designTokens } from '@hkdigital/lib-core/design/index.js';

console.log(designTokens.DESIGN);                // { width: 1024, height: 768 }
console.log(designTokens.CLAMPING);              // Min/max scale bounds
console.log(designTokens.TEXT_POINT_SIZES);      // [1, 2, 4, 6, 8, 10, ...]
console.log(designTokens.VIEWPORT_POINT_SIZES);  // [1, 2, 4, 5, 6, 10, ...]
console.log(designTokens.TEXT_BASE_SIZES);       // { sm: {...}, md: {...}, lg: {...} }
// ... and all other token configurations
```

## Best practices

### Do's ✅
- Use `up` units for UI spacing: `p-20up`, `m-10up`
- Use `type-` classes for complete typography: `type-base-md`
- Use `ut/bt/ht` for text-related spacing: `mb-16bt`
- Use contrast colors for accessibility: `text-primary-contrast-500`
- Test across multiple screen sizes

### Don'ts ❌
- Don't use hardcoded pixel values: `p-4` → use `p-4up`
- Don't forget dark mode variants: add `-dark` classes
- Don't use `text-` classes when you need complete typography styling

## Themes

The system includes the complete **theme hkdev** with:
- Color palette (primary, secondary, tertiary, status, surface)
- Component styles (buttons, panels, inputs, etc.)
- Typography settings (fonts, weights, spacing)
- Responsive behavior

Themes are public and can be extended or customized by other projects.

## Browser Support

- Modern browsers with CSS custom properties support
- CSS `clamp()` function support
- Viewport units (`vw`, `vh`) support

## Migration Guide

If migrating from the old structure:

```javascript
// OLD
import {
  spacing,
  fontSize,
  borderRadius,
  customUtilitiesPlugin
} from '@hkdigital/lib-core/design/index.js';

export default {
  theme: {
    extend: { spacing, fontSize, borderRadius }
  },
  plugins: [customUtilitiesPlugin]
};

// NEW
import {
  generateTailwindThemeExtensions,
  designTokens,
  customUtilitiesPlugin
} from '@hkdigital/lib-core/design/index.js';

const themeExtensions = generateTailwindThemeExtensions(designTokens);

export default {
  theme: {
    extend: themeExtensions
  },
  plugins: [customUtilitiesPlugin]
};
```

---

For more examples and advanced usage, see the `/examples` routes in this library.
