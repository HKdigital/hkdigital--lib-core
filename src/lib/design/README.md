# HKdigital Design System

A comprehensive, responsive design system built for SvelteKit applications. This system provides consistent scaling, typography, spacing, and theming across all screen sizes using CSS custom properties and Tailwind CSS.

## Quick Start

### Basic Usage

```javascript
// tailwind.config.js
import { 
  spacing, 
  fontSize, 
  borderRadius, 
  customUtilitiesPlugin 
} from '@hkdigital/lib-core/design/index.js';

export default {
  theme: {
    extend: {
      spacing,
      fontSize,
      borderRadius
    }
  },
  plugins: [
    customUtilitiesPlugin
  ]
};
```

```svelte
<!-- +layout.svelte -->
<script>
  import { DESIGN, CLAMPING, rootDesignVarsHTML } from '@hkdigital/lib-core/design';
</script>

<svelte:head>
  {@html rootDesignVarsHTML(DESIGN, CLAMPING)}
</svelte:head>

{@render children()}
```

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
} from '@hkdigital/lib-core/design';

// Get current design dimensions
const designWidth = getRootCssDesignWidth();   // 1024
const designHeight = getRootCssDesignHeight(); // 768

// Get all current scaling factors
const scales = getAllRootScalingVars();
// Returns: { scaleW, scaleH, scaleViewport, scaleUI, scaleTextBase, scaleTextHeading, scaleTextUI }
```

### Clamp Utilities

```javascript
import { clamp, getClampParams } from '@hkdigital/lib-core/design';

// Mathematical clamp function
const value = clamp(0.5, 0.3, 2.0); // Returns 0.5 (clamped between 0.5 and 2.0)

// Extract clamp parameters from CSS variables
const params = getClampParams('scale-ui');
// Returns: { min: 0.3, max: 2.0 }
```

### Component State Classes

```javascript
import { toStateClasses } from '@hkdigital/lib-core/design';

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
import { enableScalingUI } from '@hkdigital/lib-core/design';

// Enable automatic viewport scaling
const cleanup = enableScalingUI(DESIGN, CLAMPING);

// Call cleanup when component is destroyed
onDestroy(cleanup);
```

#### Container-Based Scaling

```javascript
import { enableContainerScaling } from '@hkdigital/lib-core/design';

let containerElement;

// Enable scaling for specific container
const cleanup = enableContainerScaling({
  container: containerElement,
  design: DESIGN,
  clamping: CLAMPING,
  useResizeObserver: true
});

// Optional custom dimension getter
const cleanupCustom = enableContainerScaling({
  container: containerElement,
  design: DESIGN,
  clamping: CLAMPING,
  getDimensions: () => ({ width: 800, height: 600 })
});
```

```svelte
<!-- Svelte component example -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { enableContainerScaling, DESIGN, CLAMPING } from '@hkdigital/lib-core/design';
  
  let containerElement;
  let cleanup;
  
  onMount(() => {
    cleanup = enableContainerScaling({
      container: containerElement,
      design: DESIGN,
      clamping: CLAMPING
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
// your-project/src/lib/design/design-config.js
import { 
  generateTextBasedSpacing,
  generateTextStyles 
} from '@hkdigital/lib-core/design';

// Custom design dimensions
export const CUSTOM_DESIGN = {
  width: 1440,
  height: 900
};

// Custom text sizes
export const CUSTOM_TEXT_SIZES = {
  sm: { size: 12, lineHeight: 1.4 },
  md: { size: 16, lineHeight: 1.4 },
  lg: { size: 20, lineHeight: 1.4 }
};

// Generate custom extensions
export const customSpacing = generateTextBasedSpacing([8, 12, 16, 24, 32]);
export const customFontSize = generateTextStyles(CUSTOM_TEXT_SIZES, 'base');
```

### Available Generator Functions

```javascript
import {
  generateTextBasedSpacing,      // ut/bt/ht spacing units
  generateViewportBasedSpacing,  // up/wp/hp spacing units
  generateTextStyles,            // Complete typography styles
  generateBorderRadiusStyles,    // Border radius with scaling
  generateWidthStyles            // Border/stroke width with scaling
} from '@hkdigital/lib-core/design';
```

### Configuration Objects

All configuration objects are exported for customization:

```javascript
import {
  DESIGN,                 // { width: 1024, height: 768 }
  CLAMPING,              // Min/max scale bounds
  TEXT_POINT_SIZES,      // [1, 2, 4, 6, 8, 10, ...]
  VIEWPORT_POINT_SIZES,  // [1, 2, 4, 5, 6, 10, ...]
  TEXT_BASE_SIZES,       // { sm: {...}, md: {...}, lg: {...} }
  TEXT_HEADING_SIZES,    // { h1: {...}, h2: {...}, ... }
  TEXT_UI_SIZES,         // { sm: {...}, md: {...}, lg: {...} }
  RADIUS_SIZES,          // Border radius configurations
  BORDER_WIDTH_SIZES,    // Border width configurations
  STROKE_WIDTH_SIZES     // Stroke width configurations
} from '@hkdigital/lib-core/design';
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
import { DESIGN } from '$lib/design/design-config.js';
import { customUtilitiesPlugin } from '$lib/design/skeleton.js';

// NEW
import { DESIGN, customUtilitiesPlugin } from '@hkdigital/lib-core/design';
```

---

For more examples and advanced usage, see the `/examples` routes in this library.
