# PageScaling

Applies viewport-based design scaling to the page by setting CSS custom
properties (`--scale-ui`, `--scale-text-base`, etc.) on `:root`. Renders
children directly with no wrapper element.

Place it in your root layout to activate scaling for the entire app.

## Basic usage

```svelte
<!-- +layout.svelte -->
<script>
  import { PageScaling } from '$lib/ui/components.js';
</script>

<PageScaling>
  {@render children()}
</PageScaling>
```

## Scaling modes

| Mode | Formula | Use case |
|---|---|---|
| `'width'` | `scaleW` | websites, scrollable pages **(default)** |
| `'fit'` | `min(scaleW, scaleH)` | games, fixed-aspect containers |
| `'height'` | `scaleH` | rare, vertically fixed layouts |
| `'fill'` | `max(scaleW, scaleH)` | cover/zoom effect |

Import the constants instead of using raw strings:

```javascript
import {
  SCALING_WIDTH,
  SCALING_FIT,
  SCALING_HEIGHT,
  SCALING_FILL
} from '$lib/design/index.js';
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `design` | `{width, height}` | `{width: 1024, height: 768}` | Reference design dimensions |
| `clamping` | `object` | default tokens | Min/max bounds per scale type |
| `viewportScalingMode` | `string` | `'width'` | How to derive `--scale-viewport` from viewport |
| `children` | `Snippet` | — | Page content |

## Custom design dimensions

```svelte
<script>
  import { PageScaling } from '$lib/ui/components.js';
  import { SCALING_WIDTH } from '$lib/design/index.js';
</script>

<PageScaling
  design={{ width: 1440, height: 900 }}
  viewportScalingMode={SCALING_WIDTH}
>
  {@render children()}
</PageScaling>
```

## CSS custom properties set

- `--scale-w` — width ratio (viewport / design width)
- `--scale-h` — height ratio (viewport / design height)
- `--scale-viewport` — the effective scale (depends on mode)
- `--scale-ui` — clamped UI scale (used by `up` spacing units)
- `--scale-text-base` — clamped base text scale
- `--scale-text-heading` — clamped heading scale
- `--scale-text-ui` — clamped UI text scale

These are consumed automatically by all design system spacing and
typography classes (`p-20up`, `type-heading-h1`, etc.).

## How it differs from GameBox

`PageScaling` is for websites and scrollable pages:

- no wrapper div — renders children directly
- defaults to `'width'` scaling (height doesn't constrain scrollable content)
- no orientation handling, no fullscreen logic, no aspect ratio math

Use `GameBox` when you need a fixed-aspect canvas with orientation
switching and fullscreen support.
