# PageScaling

Applies viewport-based design scaling to the page by setting CSS custom
properties (`--scale-ui`, `--scale-text-base`, etc.) on `:root`. Also
sets `data-viewport` on `<html>` so components can adapt to named
viewport sizes (`sm` / `md` / `lg`) via CSS. Renders children directly
with no wrapper element.

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

| Mode       | Formula            | Use case                            |
|------------|--------------------|-------------------------------------|
| `'width'`  | `scaleW`           | websites, scrollable pages **(default)** |
| `'fit'`    | `min(scaleW, scaleH)` | games, fixed-aspect containers   |
| `'height'` | `scaleH`           | rare, vertically fixed layouts      |
| `'fill'`   | `max(scaleW, scaleH)` | cover/zoom effect                |

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

| Prop                  | Type                 | Default                      | Description                      |
|-----------------------|----------------------|------------------------------|----------------------------------|
| `design`              | `{width, height}`    | `{width: 1024, height: 768}` | Reference design dimensions      |
| `clamping`            | `object`             | default tokens               | Min/max bounds per scale type    |
| `breakpoints`         | `{[name]: minWidth}` | `{sm:640, md:768, lg:1024}`  | Viewport breakpoints             |
| `viewportScalingMode` | `string`             | `'width'`                    | How to derive `--scale-viewport` |
| `children`            | `Snippet`            | —                            | Page content                     |

## Viewport sizes

`data-viewport` is set on `<html>` based on `window.innerWidth`,
matching Tailwind's breakpoint names. If no breakpoint with minWidth 0
is defined, `responsive` is added automatically as fallback so
`data-viewport` is always set.

| Value        | Min width                  |
|--------------|----------------------------|
| `responsive` | 0px (auto-added fallback)  |
| `sm`         | 640px                      |
| `md`         | 768px                      |
| `lg`         | 1024px                     |

Components use this in CSS to adapt their appearance without any
JavaScript:

```css
/* default — responsive */
[data-component='card'] { font-size: 14px; }

/* md and lg via explicit data-size prop */
[data-component='card'][data-size='md'] { font-size: 16px; }
[data-component='card'][data-size='lg'] { font-size: 18px; }

/* md and lg via viewport (when no data-size is set) */
:is([data-viewport='md']) [data-component='card']:not([data-size]) {
  font-size: 16px;
}
:is([data-viewport='lg']) [data-component='card']:not([data-size]) {
  font-size: 18px;
}
```

Combining both selectors avoids repeating the size styles:

```css
[data-component='card'] {

  &[data-size='md'],
  :is([data-viewport='md']) &:not([data-size]) {
    font-size: 16px;
  }

  &[data-size='lg'],
  :is([data-viewport='lg']) &:not([data-size]) {
    font-size: 18px;
  }

}
```

### Component size prop

Components accept a `size` prop (`'sm'` | `'md'` | `'lg'`) that sets
`data-size` on the element. When omitted, the viewport size applies.

```svelte
<Card />              <!-- follows viewport -->
<Card size="sm" />    <!-- always sm, ignores viewport -->
<Card size="md" />    <!-- always md, ignores viewport -->
```

### Custom breakpoints

Any `{ name: minWidth }` pairs — the highest matching breakpoint wins.
Tailwind's full lineup for reference:

```javascript
{ sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
```

```svelte
<PageScaling breakpoints={{ sm: 640, md: 768, lg: 1024, xl: 1280 }}>
  {@render children()}
</PageScaling>
```

## CSS custom properties set

| Property              | Description                                      |
|-----------------------|--------------------------------------------------|
| `--scale-w`           | Width ratio (viewport / design width)            |
| `--scale-h`           | Height ratio (viewport / design height)          |
| `--scale-viewport`    | Effective scale (depends on mode)                |
| `--scale-ui`          | Clamped UI scale (used by `up` spacing units)    |
| `--scale-text-base`   | Clamped base text scale                          |
| `--scale-text-heading`| Clamped heading scale                            |
| `--scale-text-ui`     | Clamped UI text scale                            |

These are consumed automatically by all design system spacing and
typography classes (`p-20up`, `type-heading-h1`, etc.).

## How it differs from GameBox

`PageScaling` is for websites and scrollable pages:

- no wrapper div — renders children directly
- defaults to `'width'` scaling (height doesn't constrain scrollable content)
- no orientation handling, no fullscreen logic, no aspect ratio math

Use `GameBox` when you need a fixed-aspect canvas with orientation
switching and fullscreen support.
