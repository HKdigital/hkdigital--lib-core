# Meta Folder Template

This folder contains templates for setting up SEO, PWA, and favicon configuration in your SvelteKit project.

## Quick Start

### 1. Copy this folder to your project

```bash
# From your project root
cp -r node_modules/@hkdigital/lib-core/templates/meta src/routes/\(meta\)
```

### 2. Customize your configuration

Edit `src/routes/(meta)/config.js` with your app's information:

```javascript
export const name = 'Your App Name';
export const shortName = 'YourApp';
export const description = 'Your app description';
export const backgroundAndThemeColor = '#your-color';
// ... etc
```

### 3. Replace placeholder images

Replace these files with your own images:
- `favicon.png` - 512×512px or larger (PNG with transparency)
- `preview-landscape.png` - 1200×630px landscape preview (JPG or PNG)
- `preview-square.png` - 1200×1200px square preview (JPG or PNG)

### 4. Add to your root layout

In `src/routes/+layout.svelte`:

```svelte
<script>
  import { Favicons, PWA, SEO, config } from './(meta)/index.js';

  let { children, data } = $props();
</script>

<Favicons {config} />
<PWA {config} />
<SEO {config} locale={data?.locale} />

{@render children()}
```

### 5. Update app.html

Add placeholders to `src/app.html`:

```html
<!doctype html>
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <title>%title%</title>
    <meta name="description" content="%description%">
    %sveltekit.head%
  </head>
  <body>
    %sveltekit.body%
  </body>
</html>
```

### 6. Configure hooks (optional)

For language detection, add to `src/hooks.server.js`:

```javascript
import { handleLang } from './routes/(meta)/index.js';

export async function handle({ event, resolve }) {
  return handleLang(event, resolve);
}
```

## How It Works

**Library code** (automatically updated):
- Components imported from `@hkdigital/lib-core/meta/components`
- Utilities imported from `@hkdigital/lib-core/meta/utils`
- Types imported from `@hkdigital/lib-core/meta/typedef`
- When you update the library, components get bug fixes automatically

**Your code** (you customize):
- `config.js` - Your app's configuration
- `index.js` - Imports library and passes your config
- `favicon.png`, `preview-*.png` - Your images
- Route endpoints - Dynamically generate manifest.json, robots.txt, sitemap.xml

## Documentation

For complete documentation, see:
- Main docs: `node_modules/@hkdigital/lib-core/src/lib/meta/README.md`
- Example: `node_modules/@hkdigital/lib-core/src/routes/(meta)/` folder

## Updating

When you update `@hkdigital/lib-core`:
1. Components are automatically updated
2. Your config and images remain untouched
3. Check changelog for breaking config changes
