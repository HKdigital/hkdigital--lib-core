# (meta) Folder - PWA and Favicon Configuration

This folder contains all PWA (Progressive Web App) and favicon configuration
for the application. It uses SvelteKit's route grouping with parentheses to
keep these files organized without affecting the URL structure.

## How It Works

The `(meta)` folder is a **route group** - the parentheses mean this folder's
name doesn't appear in URLs. All components are imported into the root
`+layout.svelte` and rendered in `<svelte:head>` to inject meta tags, links,
and PWA configuration into every page.

### File Structure

```
(meta)/
├── config.js          # Central configuration (name, colors, icons)
├── Favicons.svelte    # Generates favicon and apple-touch-icon links
├── PWA.svelte         # Generates PWA meta tags (viewport, theme-color)
├── favicon.png        # Source image (512x512 recommended)
├── index.js           # Exports components for easy import
└── manifest.json/     # Dynamic manifest.json endpoint
    └── +server.js
```

## Usage in Your Project

### 1. Import into Root Layout

In `src/routes/+layout.svelte`:

```svelte
<script>
  import { Favicons, PWA } from './(meta)/index.js';
</script>

<Favicons />
<PWA />

{@render children()}
```

### 2. Configure Your App

Edit `config.js` to customize your app:

```javascript
// App identity
export const name = 'Your App Name';
export const shortName = 'App';  // max 12 characters
export const description = 'Your app description';

// Colors (PWA theme)
export const backgroundAndThemeColor = '#082962';

// iOS status bar style: 'default' | 'black' | 'black-translucent'
export const statusBarStyle = 'black-translucent';

// Screen orientation: 'any' | 'landscape' | 'portrait'
export const orientation = 'any';

// Disable pinch-to-zoom (only enable for games/canvas apps)
export const disablePageZoom = false;
```

### 3. Replace the Source Image

Replace `favicon.png` with your own 512×512px image. The imagetools
integration will automatically generate all required sizes:

- **Browser icons**: 16, 32, 48
- **iOS icons**: 120, 152, 167, 180
- **Android/PWA icons**: 192, 512

Each import like `?w=16` generates:
- The requested size (16px)
- A thumbnail version (150px)

## What Gets Generated

### Favicon Links (Favicons.svelte)

Generates standard favicon links for browsers and apple-touch-icon links for
iOS devices:

```html
<link rel="icon" type="image/png" sizes="16x16" href="..." />
<link rel="icon" type="image/png" sizes="32x32" href="..." />
<!-- ... more sizes ... -->
<link rel="apple-touch-icon" sizes="180x180" href="..." />
```

### PWA Meta Tags (PWA.svelte)

Generates Progressive Web App configuration:

```html
<meta name="viewport" content="..." />
<meta name="theme-color" content="#082962" />
<link rel="manifest" href="/manifest.json" />

<!-- iOS-specific -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="..." />
<meta name="apple-mobile-web-app-title" content="..." />
```

### Dynamic Manifest (manifest.json/+server.js)

Serves a dynamic `/manifest.json` endpoint with PWA configuration including
app name, description, icons, theme colors, display mode, and orientation.

## Why This Approach?

1. **Centralized**: All meta/PWA config in one place
2. **Type-safe**: JSDoc types for favicon objects
3. **DRY**: Single source of truth in `config.js`
4. **Clean URLs**: Route grouping keeps files organized without URL clutter
5. **Minimal app.html**: Core HTML stays clean, all meta tags injected via
   Svelte components

### Keeping app.html Minimal

The `src/app.html` file stays extremely simple:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My initial page title</title>
    %sveltekit.head%
  </head>
  <body data-theme="hkdev" data-sveltekit-preload-data="hover">
    <div data-label="sveltekit-body">%sveltekit.body%</div>
  </body>
</html>
```

All favicon links, PWA meta tags, and manifest configuration are injected
through `%sveltekit.head%` via the `<Favicons />` and `<PWA />` components
in the root layout. This keeps the base HTML template clean and makes all
meta configuration dynamic and maintainable through JavaScript/Svelte.

## Customizing Icon Sizes

If you need additional sizes, add them to:

1. `config.js` - Import and add to `favicons` array
2. `src/lib/config/imagetools.d.ts` - Add TypeScript declaration

Example:

```javascript
// config.js
import favicon96 from './favicon.png?w=96';

export const favicons = [
  // ... existing sizes
  { size: 96, url: favicon96[0].src }, // custom size
];
```

```typescript
// imagetools.d.ts
declare module '*?w=96' {
  const out: ImageSource;
  export default out;
}
```
