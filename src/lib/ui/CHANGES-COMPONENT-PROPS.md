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
- More components will be updated following this pattern
