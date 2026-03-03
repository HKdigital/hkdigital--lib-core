# Meta Configuration Template

This template provides a complete setup for SEO, PWA, and favicon configuration in your SvelteKit project.

## Quick Start

### 1. Copy template files to your project

```bash
# From your project root
cp -r node_modules/@hkdigital/lib-core/meta/templates/lib/* src/lib/
cp -r node_modules/@hkdigital/lib-core/meta/templates/routes/* src/routes/
```

This copies:
- `src/lib/meta/config.js` - Your configuration file
- `src/lib/assets/meta/*.png` - Placeholder images
- `src/lib/meta.js` - Glue file connecting library and config
- `src/routes/(meta)/*.json/+server.js` - Route endpoints

### 2. Customize your configuration

Edit `src/lib/meta/config.js` with your app's information:

```javascript
export const name = 'Your App Name';
export const shortName = 'YourApp';
export const description = 'Your app description';
export const backgroundAndThemeColor = '#your-color';
// ... etc
```

### 3. Replace placeholder images

Replace these files in `src/lib/assets/meta/` with your own:
- `favicon.png` - 512×512px or larger (PNG with transparency)
- `preview-landscape.png` - 1200×630px landscape preview (JPG or PNG)
- `preview-square.png` - 1200×1200px square preview (JPG or PNG)

### 4. Add to your root layout

In `src/routes/+layout.svelte`:

```svelte
<script>
  import { Favicons, PWA, SEO, config } from '$lib/meta.js';

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
import { handleLang } from '$lib/meta.js';

export async function handle({ event, resolve }) {
  return handleLang(event, resolve);
}
```

## File Structure

After copying the template, your project will have:

```
src/
  lib/
    config/
      meta.js           # Your configuration (customize this)
    assets/
      meta/
        favicon.png     # Your favicon image
        preview-landscape.png
        preview-square.png
    meta.js             # Glue file (imports library + config)
  routes/
    (meta)/             # Route group (not in URL)
      manifest.json/
        +server.js      # PWA manifest endpoint
      robots.txt/
        +server.js      # Robots.txt endpoint
      sitemap.xml/
        +server.js      # Sitemap endpoint
    +layout.svelte      # Import from $lib/meta.js
  hooks.server.js       # Optional: language detection
  app.html              # Add %lang%, %title%, %description%
```

## How It Works

**Library code** (automatically updated):
- Components imported from `@hkdigital/lib-core/meta/components`
- Utilities imported from `@hkdigital/lib-core/meta/utils`
- When you update the library, components get bug fixes automatically

**Your code** (you customize):
- `src/lib/meta/config.js` - Your app's configuration
- `src/lib/assets/meta/*.png` - Your images
- `src/lib/meta.js` - Connects library components with your config
- `src/routes/(meta)/` - Route endpoints that use your config

## Configuration Not in Routes

Note that `config/meta.js` is in `src/lib/`, NOT in `src/routes/`. This is intentional:

- Files in `src/routes/` can be served via HTTP
- Route groups like `(meta)` only affect layout grouping, not HTTP access
- Keeping config in `src/lib/` prevents accidental HTTP exposure
- Images in `src/lib/assets/` are processed by Vite imagetools at build time

## Updating

When you update `@hkdigital/lib-core`:
1. Library components are automatically updated
2. Your config and images remain untouched
3. Check changelog for breaking config changes

## Documentation

For complete documentation, see:
- Main docs: `node_modules/@hkdigital/lib-core/meta/README.md`
- Component API: Check library source in `node_modules/@hkdigital/lib-core/meta/`
