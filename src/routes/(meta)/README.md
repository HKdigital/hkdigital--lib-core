# (meta) Folder - PWA and Favicon Configuration

This folder contains all PWA (Progressive Web App) and favicon configuration
for the application. It uses SvelteKit's route grouping with parentheses to
keep these files organized without affecting the URL structure.

**For New Projects**: Copy this entire folder to your project's
`src/routes/` directory, customize the favicon and configuration, then
integrate into your root layout. See the Getting Started section below.

## How It Works

The `(meta)` folder is a **route group** - the parentheses mean this folder's
name doesn't appear in URLs. All components are imported into the root
`+layout.svelte` and rendered in `<svelte:head>` to inject meta tags, links,
and PWA configuration into every page.

## Getting Started

### 1. Copy the (meta) Folder to Your Project

Copy the entire `(meta)` folder from the library to your project:

```bash
# From your project root
cp -r node_modules/@hkdigital/lib-core/src/routes/\(meta\) src/routes/
```

Or manually copy the folder using your file explorer.

### 2. Customize Your App Configuration

**Replace the favicon image:**

Replace `src/routes/(meta)/favicon.png` with your own image:
- Recommended size: 512×512px or larger
- Format: PNG with transparency support
- The imagetools plugin will automatically generate all required sizes

**Edit the configuration:**

Edit `src/routes/(meta)/config.js` with your app's information:

```javascript
// App identity
export const name = 'Your App Name';
export const shortName = 'App';  // max 12 characters
export const description = 'Your app description';

// Colors (PWA theme)
export const backgroundAndThemeColor = '#082962';

// iOS status bar: 'default' | 'black' | 'black-translucent'
export const statusBarStyle = 'black-translucent';

// Screen orientation: 'any' | 'landscape' | 'portrait'
export const orientation = 'any';

// Disable pinch-to-zoom (only for games/canvas apps)
export const disablePageZoom = false;

// Add your routes (simple format - smart defaults applied)
export const siteRoutes = [
  '/',           // Gets priority 1.0, changefreq 'daily'
  '/about',      // Gets priority 0.8, changefreq 'weekly'
  '/contact'     // Gets priority 0.8, changefreq 'weekly'
];
```

### 3. Integrate into Root Layout

Import and use the components in `src/routes/+layout.svelte`:

```svelte
<script>
  import { Favicons, PWA } from './(meta)/index.js';

  let { children } = $props();
</script>

<Favicons />
<PWA />

{@render children()}
```

### 4. Verify It Works

Start your development server and check:

1. **Browser tab**: Should show your favicon
2. **View source**: Should see generated `<link>` tags for favicons and
   apple-touch-icons
3. **Visit `/manifest.json`**: Should return your PWA configuration
4. **Browser DevTools** → Application → Manifest: Should show your app info

For robots.txt and sitemap.xml configuration, see `$lib/meta/README.md`.

### File Structure

```
(meta)/
├── config.js          # Central configuration (name, colors, routes)
├── Favicons.svelte    # Generates favicon and apple-touch-icon links
├── PWA.svelte         # Generates PWA meta tags (viewport, theme-color)
├── favicon.png        # Source image (512x512 recommended)
├── index.js           # Exports components for easy import
├── manifest.json/     # Dynamic manifest.json endpoint
│   └── +server.js
├── robots.txt/        # @see @hkdigital/lib-core/meta/README.md
│   └── +server.js
└── sitemap.xml/       # @see @hkdigital/lib-core/meta/README.md
    └── +server.js
```

## Technical Details

### Imagetools Integration

The favicon.png source image is processed automatically using imagetools query
parameters:

- **`?favicons`**: Generates browser and PWA icons (16, 32, 192, 512)
- **`?apple-touch-icons`**: Generates iOS-specific icons
  (120, 152, 167, 180)

No manual size configuration needed - just replace the source image with your
own 512×512px or larger PNG file.

### Configuration Options

The `config.js` file provides centralized configuration:

```javascript
// App identity
export const name = 'Your App Name';
export const shortName = 'App';  // max 12 characters
export const description = 'Your app description';

// Colors (PWA theme)
export const backgroundAndThemeColor = '#082962';
export const themeColor = backgroundAndThemeColor;
export const backgroundColor = backgroundAndThemeColor;

// iOS status bar: 'default' | 'black' | 'black-translucent'
export const statusBarStyle = 'black-translucent';

// Screen orientation: 'any' | 'landscape' | 'portrait'
export const orientation = 'any';

// Disable pinch-to-zoom (only for games/canvas apps)
export const disablePageZoom = false;

// Site routes and robots.txt configuration
// @see @hkdigital/lib-core/meta/README.md
export const siteRoutes = ['/'];
export const robotsConfig = { allowedHosts: '*', disallowedPaths: [] };
```

## What Gets Generated

### Favicon Links (Favicons.svelte)

Uses imagetools query parameters to automatically generate favicon links:

```svelte
<script>
  import faviconImages from './favicon.png?favicons';
  import appleTouchIcons from './favicon.png?apple-touch-icons';
</script>

<svelte:head>
  {#each faviconImages as img}
    <link rel="icon" type="image/png"
          sizes="{img.width}x{img.width}" href={img.src} />
  {/each}

  {#each appleTouchIcons as img}
    <link rel="apple-touch-icon"
          sizes="{img.width}x{img.width}" href={img.src} />
  {/each}
</svelte:head>
```

### PWA Meta Tags (PWA.svelte)

Generates Progressive Web App configuration with dynamic title handling and
responsive viewport settings:

```svelte
<script>
  import { onMount } from 'svelte';
  import {
    themeColor,
    statusBarStyle,
    name,
    shortName,
    disablePageZoom
  } from './config.js';

  let shouldSetTitle = $state(false);

  onMount(() => {
    const titleElement = document.querySelector('title');
    const hasTitle = titleElement && titleElement.textContent.trim() !== '';
    if (!hasTitle) {
      shouldSetTitle = true;
    }
  });
</script>

<svelte:head>
  {#if shouldSetTitle}
    <title>{name}</title>
  {/if}

  {#if !disablePageZoom}
    <meta name="viewport" content="width=device-width, initial-scale=1">
  {:else}
    <meta name="viewport"
         content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no,
                  width=device-width, viewport-fit=cover" />
  {/if}

  <meta name="theme-color" content="{themeColor}">
  <link rel="manifest" href="/manifest.json">

  <!-- iOS-specific -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style"
        content="{statusBarStyle}">
  <meta name="apple-mobile-web-app-title" content="{shortName}">
</svelte:head>
```

### Dynamic Manifest (manifest.json/+server.js)

Serves a dynamic `/manifest.json` endpoint with PWA configuration:

```javascript
import {
  name,
  shortName,
  description,
  backgroundAndThemeColor,
  orientation
} from '../config.js';

import faviconImages from '../favicon.png?favicons';

const manifest = {
  name,
  short_name: shortName,
  description,
  start_url: '/',
  scope: '/',
  icons: faviconImages.map((item) => ({
    src: item.src,
    sizes: `${item.width}x${item.width}`,
    type: 'image/png'
  })),
  theme_color: backgroundAndThemeColor,
  background_color: backgroundAndThemeColor,
  display: 'fullscreen',
  orientation
};

export const GET = async () => {
  return new Response(JSON.stringify(manifest));
};
```

### Dynamic Sitemap and Robots.txt

The `sitemap.xml/` and `robots.txt/` endpoints generate dynamic SEO content.

For detailed configuration and usage, see
**`@hkdigital/lib-core/meta/README.md`**.

## Why This Approach?

1. **Centralized**: All meta/PWA config in one place
2. **Automatic**: Imagetools generates all required sizes from one source file
3. **DRY**: Single source of truth in `config.js`
4. **Clean URLs**: Route grouping keeps files organized without URL clutter
5. **Minimal app.html**: Core HTML stays clean, all meta tags injected via
   Svelte components
6. **Dynamic Title**: Automatically sets page title only if not already
   defined by individual routes

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

The imagetools integration handles all standard sizes automatically via the
`?favicons` and `?apple-touch-icons` query parameters. These are configured
in the Vite/SvelteKit imagetools plugin configuration.

If you need custom sizes, you can:

1. Modify the imagetools plugin configuration in `vite.config.js`
2. Or import specific sizes directly:

```javascript
// For a custom size (e.g., 96x96)
import favicon96 from './favicon.png?w=96&format=png';
```

The standard configurations already cover all common use cases:
- **Browsers**: 16×16, 32×32 (favicons)
- **PWA**: 192×192, 512×512 (favicons)
- **iOS**: 120×120, 152×152, 167×167, 180×180 (apple-touch-icons)
