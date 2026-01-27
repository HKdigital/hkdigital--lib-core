# UI Component Changes

## Property Name Changes (2026-01)

### Background
Skeleton.dev has updated their component API standards, and we follow
skeleton standards for consistency across the ecosystem.

### Changes

#### `classes` → `class`
All UI components now accept `class` instead of `classes` for CSS
class names.

#### `base` → removed
The `base` property has been deprecated. Use `class` instead.

#### `bg` → removed
The `bg` property has been deprecated. Use `class` instead.

### Migration Guide

**Before:**
```svelte
<SteezeIcon
  base="icon-base"
  classes="text-primary-500"
  src={icon}
/>

<GameBox
  base="box-base"
  bg="bg-surface-100"
  classes="rounded-md"
/>
```

**After:**
```svelte
<SteezeIcon
  class="icon-base text-primary-500"
  src={icon}
/>

<GameBox
  class="box-base bg-surface-100 rounded-md"
/>
```

### Implementation Pattern

All components follow this exact pattern for backward compatibility:

**JSDoc Type:**
```javascript
/**
 * @type {{
 *   class?: string,
 *   base?: string,  // Deprecated: use 'class' instead
 *   bg?: string,  // Deprecated: use 'class' instead (if applicable)
 *   classes?: string,  // Deprecated: use 'class' instead
 *   // ... other props
 * }}
 */
```

**Props Destructuring:**
```javascript
const {
  class: className,
  base,  // Deprecated: kept for backward compatibility
  bg,  // Deprecated: kept for backward compatibility (if applicable)
  classes,  // Deprecated: kept for backward compatibility
  // ... other props
} = $props();
```

**Class Attribute Usage:**
```svelte
<!-- With bg prop -->
<div class="{base ?? ''} {bg ?? ''} {className ?? classes ?? ''}"></div>

<!-- Without bg prop -->
<div class="{base ?? ''} {className ?? classes ?? ''}"></div>
```

**Priority Order:**
1. `base` - applied first if provided
2. `bg` - applied second if provided and component supports it
3. `className` - from new `class` prop, applied if `classes` not provided
4. `classes` - deprecated fallback, applied if `className` not provided

### Backward Compatibility

During the transition period, components accept both old and new
property names:

- `class` - new standard (recommended)
- `classes` - deprecated, still works
- `base` - deprecated, still works
- `bg` - deprecated, still works (GameBox only)

All properties will be merged if provided together, allowing gradual
migration without breaking existing code.

### Timeline

- **Now**: Both old and new properties supported
- **Future**: `base`, `bg`, and `classes` will be removed in a future
  major version

### Affected Components

- `SteezeIcon.svelte`
- `GameBox.svelte`
- `ImageBox.svelte`
- `Presenter.svelte`
- `GridLayers.svelte`
- `Panel.svelte`
- `Button.svelte`
- More components will be updated following this pattern
