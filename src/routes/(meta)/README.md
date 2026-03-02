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

**Replace the source images:**

1. **Favicon** - Replace `src/routes/(meta)/favicon.png`:
   - Size: 512×512px or larger
   - Format: **PNG only** (transparency required for dark mode browsers)
   - Used for: Browser tabs, PWA icons, iOS home screen
   - Target size: ~50-100KB after processing

2. **SEO Preview Landscape** - Replace
   `src/routes/(meta)/preview-landscape.png`:
   - Size: 1200×630px (landscape aspect ratio)
   - Format: **JPG recommended** (better compression, smaller files)
   - Alternative: PNG if you need crisp text or transparency
   - Used for: Facebook, LinkedIn, Discord link previews
   - Target size: ~100-200KB
   - Preprocessor outputs: JPG at 95% quality

3. **SEO Preview Square** - Replace `src/routes/(meta)/preview-square.png`:
   - Size: 1200×1200px (square aspect ratio)
   - Format: **JPG recommended** (better compression, smaller files)
   - Alternative: PNG if you need crisp text or transparency
   - Used for: Various social platforms
   - Target size: ~150-250KB
   - Preprocessor outputs: JPG at 95% quality

**Format guidelines:**
- **PNG**: Transparency, sharp text, logos. Larger file size.
- **JPG**: Photos, gradients, illustrations. Smaller file size, no transparency.

The imagetools plugin automatically processes your source images to optimized
outputs at exact dimensions.

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

// SEO social media preview images (imported and processed)
import SeoLandscapeImg from './preview-landscape.png?seo-landscape';
import SeoSquareImg from './preview-square.png?seo-square';
export const SeoImageLandscape = SeoLandscapeImg;  // 1200×630
export const SeoImageSquare = SeoSquareImg;        // 1200×1200

// Language and locale configuration
export const languages = {
  'en': { lang: 'en-GB', locale: 'en_GB' },
  'nl': { lang: 'nl-NL', locale: 'nl_NL' }
};
export const defaultLanguage = 'en';

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
  import { Favicons, PWA, SEO } from './(meta)/index.js';

  let { children, data } = $props();
</script>

<Favicons />
<PWA />
<SEO {data} />

{@render children()}
```

The `data` prop passes language/locale information from hooks to the SEO
component for automatic localization.

### 4. Configure AI Bot Control (Optional)

Control whether AI bots can crawl your site via `robotsConfig` in `config.js`:

```javascript
export const robotsConfig = {
  allowedHosts: '*',
  disallowedPaths: [],

  // Site-wide AI bot control
  allowAiTraining: false,  // Block GPTBot, Google-Extended, CCBot, etc.
  allowAiReading: false    // Block ChatGPT-User, Claude-Web, etc.
};
```

**Site-wide vs Per-Page:**
- **robots.txt** (site-wide): Use `robotsConfig.allowAiTraining/allowAiReading`
- **Meta tags** (per-page): Use `<SEO noAiTraining={true} />`

Both methods block AI bots, but robots.txt applies to the entire site while
meta tags apply to specific pages.

### 5. Configure Language Detection (Optional)

The (meta) folder includes automatic language detection based on URL paths.
Both language and app title are automatically injected into the HTML.

**Automatic placeholders in app.html:**
- `%lang%` → Replaced with language code (e.g., `en-GB`)
- `%title%` → Replaced with `name` from config.js
- `%description%` → Replaced with `description` from config.js

These provide sensible defaults for all pages. Individual pages can override
by using the `<SEO />` component.

**How language detection works:**
- `/en/shop` → Sets `<html lang="en-GB">` and `og:locale="en_GB"`
- `/nl/winkel` → Sets `<html lang="nl-NL">` and `og:locale="nl_NL"`
- `/en-us/shop` → Sets `<html lang="en-US">` and `og:locale="en_US"`

#### Integrating Language Detection into Hooks

The library includes `handleLang` for language detection, but you likely
already have a `hooks.server.js` with authentication, session management,
logging, etc. Here are integration patterns:

#### Option 1: Simple Case (No Existing Hooks)

```javascript
// hooks.server.js
import { handleLang } from './routes/(meta)/lang.js';

export async function handle({ event, resolve }) {
  return handleLang(event, resolve);
}
```

#### Option 2: Existing Hooks (Recommended)

If you already have hooks, **don't call `handleLang`**. Instead, use
`getLangFromPath` to detect language and set `locals`, then use
`injectLang` in `transformPageChunk`:

```javascript
// hooks.server.js
import { getLangFromPath, injectLang } from './routes/(meta)/lang.js';

export async function handle({ event, resolve }) {
  const { cookies, locals } = event;

  // 1. Detect language first (before other processing)
  const { langCode, lang, locale } = getLangFromPath(event.url.pathname);
  event.locals.langCode = langCode;
  event.locals.lang = lang;
  event.locals.locale = locale;

  // 2. Your existing code here
  const logger = getServerLogger();
  logger.debug(`Route: ${event.url.pathname}`);

  // Handle admin auth
  const adminAuthResponse = await handleAdminAuth(event, resolve);
  if (adminAuthResponse) {
    return adminAuthResponse;
  }

  // Session management
  if (!shouldSkipSession(event.url.pathname)) {
    const sessionService = getServerSessionService();
    // ... your session code ...
    locals.sessionData = sessionData;
  }

  // 3. Resolve with language and title injection
  return resolve(event, {
    transformPageChunk: ({ html }) => injectLang(html, lang)
  });
}
```

**Key points:**
- Call `getLangFromPath()` early to set `locals`
- Add your existing logic in between
- Use `transformPageChunk` at the end to inject %lang%, %title%, and
  %description% into HTML

**Complete real-world example:**

```javascript
// hooks.server.js - Full example with auth, sessions, and language
import { getLangFromPath, injectLang } from './routes/(meta)/lang.js';

export async function handle({ event, resolve }) {
  const { cookies, locals } = event;

  // Language detection (do this first!)
  const { langCode, lang, locale } = getLangFromPath(event.url.pathname);
  event.locals.langCode = langCode;
  event.locals.lang = lang;
  event.locals.locale = locale;

  const logger = getServerLogger();
  logger.debug(`Route: ${event.url.pathname} [${lang}]`);

  if (dev && event.url.pathname === '/.well-known/...') {
    return new Response(undefined, { status: 404 });
  }

  // Admin auth check
  const adminAuthResponse = await handleAdminAuth(event, resolve);
  if (adminAuthResponse) {
    return adminAuthResponse;
  }

  // Session management
  if (!shouldSkipSession(event.url.pathname)) {
    const sessionService = getServerSessionService();
    const jwtService = getJwtServerService();

    let sessionId = null;
    let sessionData = null;
    let tokenPayload = null;

    const token = cookies.get(COOKIE_TOKEN);
    if (token) {
      try {
        tokenPayload = jwtService.verifyToken(token);
      } catch {
        logger.debug('Invalid or expired token');
      }
    }

    if (tokenPayload?.ssid) {
      sessionId = tokenPayload.ssid;
      sessionData = await sessionService.getSessionData(sessionId);
    }

    if (!sessionData) {
      sessionId = generateGlobalId();
      sessionData = await sessionService.createSession(sessionId);
      const token = jwtService.signToken(
        { [COOKIE_SESSION_ID]: sessionId },
        { expiresIn: JWT_NEVER_EXPIRES }
      );
      cookies.set(COOKIE_TOKEN, token, COOKIE_OPTIONS);
    }

    locals.sessionData = sessionData;
    logger.debug(`Session: ${sessionId}`);
  }

  // Resolve request with language injection
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => injectLang(html, lang)
  });

  return response;
}
```

#### Option 3: Sequence Multiple Handlers

If you have multiple complex handlers, use SvelteKit's `sequence`:

```javascript
// hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';
import { handleLang } from './routes/(meta)/lang.js';
import { handleAuth } from './auth.js';
import { handleSession } from './session.js';

export const handle = sequence(
  handleLang,      // Language detection first
  handleAuth,      // Then authentication
  handleSession    // Then session management
);
```

**Note:** `handleLang` must be **first** in the sequence because it uses
`transformPageChunk`, and later handlers might return early (redirects, etc.).

#### Option 4: Skip Hooks Integration (Fallback Mode)

If you don't want to modify your hooks at all:

1. Remove `handleLang` integration from `hooks.server.js`
2. Set static values in `app.html`:
   - `<html lang="en">` (remove `%lang%`)
   - `<title>Your App Name</title>` (remove `%title%`)
   - `<meta name="description" content="Your description">` (remove
     `%description%`)
3. Language detection still works client-side via `+layout.js`
4. `og:locale` will be detected from URL path

This works but loses server-side HTML injection (slightly worse for SEO and
accessibility). The `<html lang="">`, `<title>`, and meta description will be
static in the initial HTML, then JavaScript detects the correct locale for
social media tags.

**Language data is automatically available** via `src/routes/+layout.js`:

This universal load function works in both SSR and static/client-side contexts:
- **SSR**: Uses `locals` from hooks (when available)
- **Static/Client**: Detects language from URL pathname
- **Result**: Language data available to `<SEO />` and all pages

No manual configuration needed - it's already set up!

**Customize languages** in `config.js`:

```javascript
export const languages = {
  // Short codes (defaults)
  'en': { lang: 'en-GB', locale: 'en_GB' },
  'nl': { lang: 'nl-NL', locale: 'nl_NL' },

  // Add explicit variants as needed
  'en-us': { lang: 'en-US', locale: 'en_US' },
  'es': { lang: 'es-ES', locale: 'es_ES' }
};
export const defaultLanguage = 'en';
```

**Single-language sites:**
If you don't need multi-language support:
1. Remove `handleLang` from `hooks.server.js`
2. Set `<html lang="en">` and `<title>Your App Name</title>` directly in
   `src/app.html` (remove `%lang%` and `%title%` placeholders)
3. The SEO component will still work using `defaultLocale` from config

### 6. Verify It Works

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
├── config.js              # Central configuration (name, colors, routes)
├── lang.js                # Language detection and locale utilities
├── Favicons.svelte        # Generates favicon and apple-touch-icon links
├── PWA.svelte             # Generates PWA meta tags (viewport, theme)
├── SEO.svelte             # Generates SEO and social media meta tags
├── favicon.png            # Source for favicons (512×512 recommended)
├── preview-landscape.png  # SEO landscape image (1200×630 recommended)
├── preview-square.png     # SEO square image (1200×1200 recommended)
├── index.js               # Exports components and utilities
├── manifest.json/     # Dynamic manifest.json endpoint
│   └── +server.js
├── robots.txt/        # @see @hkdigital/lib-core/meta/README.md
│   └── +server.js
└── sitemap.xml/       # @see @hkdigital/lib-core/meta/README.md
    └── +server.js
```

## Per-Page SEO Customization

The `<SEO />` component in your root layout provides default SEO for all
pages. To customize SEO for a specific page, simply import and render
`<SEO />` in that page's `+page.svelte` with custom props.

The `<SEO />` component sets:
- **Browser title** (`<title>` tag) - Overrides `%title%` from app.html
- **Meta description** - Overrides `%description%` from app.html
- **Social media tags** (Open Graph) - For link previews on social platforms
- **Robots directives** - Control search engine indexing
- **hreflang tags** - Multi-language site support

```svelte
<script>
  import { SEO } from '../(meta)/index.js';
</script>

<SEO
  title="About Us | My Company"
  description="Learn about our mission, team, and values."
  url="https://mycompany.com/about"
  image="https://mycompany.com/images/about-og.png"
  imageAlt="Our team working together"
/>

<h1>About Us</h1>
<!-- Page content -->
```

**Why this works**: SvelteKit's `<svelte:head>` merges meta tags from all
components in the render tree. When the same element appears multiple times
(like `<title>` or `<meta name="description">`), the **last one wins**. Since
your page component renders after the layout, its SEO tags override both the
layout's defaults AND the `%title%` and `%description%` placeholders from
app.html.

### Available SEO Props

All props are optional and default to values from `config.js`:

- **`title`**: Page title - sets both browser `<title>` and social media
  `og:title` (defaults to `name` from config)
- **`description`**: Page description - sets both `<meta name="description">`
  and social media `og:description` (defaults to `description` from config)
- **`url`**: Canonical URL (also sets canonical link tag)
- **`image`**: Social media preview image URL (defaults to landscape image)
- **`imageAlt`**: Alt text for social media image
- **`type`**: Open Graph type (default: `'website'`)
- **`locale`**: Content locale (auto-detected from URL or config default)
- **`siteName`**: Site name for Open Graph (defaults to `name` from config)
- **`alternateUrls`**: Object mapping language codes to URLs for hreflang tags
- **`robots`**: Robots meta directives (e.g., `'noindex, nofollow'`)
- **`noAiTraining`**: Boolean to prevent AI training on content (blocks
  Google Extended, ChatGPT, Claude, etc.)

**AI bot control - Site-wide vs Per-Page:**

Use `robotsConfig` in `config.js` for **site-wide** AI blocking via
robots.txt, or use `<SEO noAiTraining={true} />` for **per-page** blocking
via meta tags.

- **Site-wide** (`robotsConfig.allowAiTraining: false`): Blocks AI bots from
  entire site via robots.txt
- **Per-page** (`<SEO noAiTraining={true} />`): Blocks AI bots from specific
  pages via meta tags

Both methods are effective. Use site-wide for consistent policy, use per-page
for selective protection (e.g., premium content only).

**Automatically generated:**
- Image metadata (width, height, type) for default images
- Alternate locale tags from `languages` in config
- hreflang links when `alternateUrls` provided

### Common Per-Page Examples

**Blog post with custom image:**

```svelte
<script>
  import { SEO } from '../(meta)/index.js';
</script>

<SEO
  title="Understanding SvelteKit Routing | Tech Blog"
  description="A deep dive into SvelteKit's file-based routing system."
  url="https://mysite.com/blog/sveltekit-routing"
  image="https://mysite.com/blog/sveltekit-routing-cover.jpg"
  type="article"
/>
```

**Multi-language page with hreflang:**

```svelte
<SEO
  title="Contact Us"
  url="https://example.com/en/contact"
  alternateUrls={{
    'en': 'https://example.com/en/contact',
    'nl': 'https://example.com/nl/contact',
    'x-default': 'https://example.com/en/contact'
  }}
/>
```

**Private page blocking search engines and AI:**

```svelte
<SEO
  title="Premium Content - Members Only"
  robots="noindex, nofollow"
  noAiTraining={true}
/>
```

**Product page with custom preview:**

```svelte
<SEO
  title="Wireless Headphones XR-500 | Our Store"
  description="Premium noise-canceling headphones with 30-hour battery life."
  url="https://store.com/products/headphones-xr500"
  image="https://store.com/images/products/xr500-social.jpg"
  imageAlt="XR-500 headphones in matte black finish"
/>
```

### Social Media Images

**Default Behavior**: By default, the SEO component uses two optimized images:

- **Landscape** (`preview-landscape.png`): 1200×630 for Facebook, LinkedIn,
  Discord
- **Square** (`preview-square.png`): 1200×1200 for various platforms

Both images are imported and exported in `config.js`. Both images are added
to the Open Graph `og:image` tags, with landscape as the primary image.
Platforms will choose the aspect ratio that best fits their layout.

Simply replace the image files with your own designs. The `?seo-landscape`
and `?seo-square` preprocessors automatically optimize and resize them to
the correct dimensions.

**Per-Page Custom Images**: For specific pages, override with custom images:

- **Format**: JPG (better compression) or PNG
- **Location**: Store in `static/images/` folder
- **URL**: Use full absolute URLs (e.g., `https://mysite.com/images/og.png`)

Example with custom image per page:

```svelte
<SEO
  title="New Product Launch"
  description="Introducing our revolutionary new product line."
  url="https://mysite.com/products/new"
  image="https://mysite.com/images/products/new-launch-og.png"
  imageAlt="Product showcase with new features highlighted"
/>
```

**Multi-Language hreflang Tags**: For multi-language sites, specify
alternate language versions:

```svelte
<SEO
  title="About Us"
  url="https://example.com/en/about"
  alternateUrls={{
    'en': 'https://example.com/en/about',
    'nl': 'https://example.com/nl/about',
    'es': 'https://example.com/es/about',
    'x-default': 'https://example.com/en/about'
  }}
/>
```

This generates proper hreflang tags for search engines and alternate locale
tags for social media platforms.

**Disabling SEO Images**: To disable SEO images in `config.js`:
1. Comment out the image imports
2. Set exports to `null`:
   ```javascript
   // export const SeoImageLandscape = null;
   // export const SeoImageSquare = null;
   ```

## Language and Locale Configuration

The (meta) folder includes automatic language detection based on URL patterns.
This sets both the HTML `lang` attribute and Open Graph `locale` for proper
SEO and accessibility.

### How It Works

The `lang.js` utility extracts language codes from URL paths:

- **`/en/shop`** → `<html lang="en-GB">` + `og:locale="en_GB"`
- **`/nl/winkel`** → `<html lang="nl-NL">` + `og:locale="nl_NL"`
- **`/en-us/shop`** → `<html lang="en-US">` + `og:locale="en_US"`

Short codes (e.g., `/en/`) default to a primary variant (e.g., `en-GB`).
Explicit codes (e.g., `/en-us/`) override the default.

### Configuration

Edit `config.js` to define supported languages:

```javascript
export const languages = {
  // Short codes map to default variants
  'en': { lang: 'en-GB', locale: 'en_GB' },
  'nl': { lang: 'nl-NL', locale: 'nl_NL' },
  'es': { lang: 'es-ES', locale: 'es_ES' },

  // Add explicit variants as needed
  'en-us': { lang: 'en-US', locale: 'en_US' },
  'en-au': { lang: 'en-AU', locale: 'en_AU' },
  'es-mx': { lang: 'es-MX', locale: 'es_MX' }
};

export const defaultLanguage = 'en';  // Fallback for non-matching URLs
```

### Integration

Language detection is enabled in `src/hooks.server.js`:

```javascript
import { handleLang } from './routes/(meta)/lang.js';

export async function handle({ event, resolve }) {
  return handleLang(event, resolve);
}
```

Language data is available in load functions:

```javascript
// +page.server.js or +layout.server.js
export async function load({ locals }) {
  return {
    lang: locals.lang,        // e.g., 'en-GB'
    locale: locals.locale,    // e.g., 'en_GB'
    langCode: locals.langCode // e.g., 'en' or 'en-us'
  };
}
```

### Single-Language Sites

For single-language sites, you can skip the dynamic setup:

1. Remove `handleLang` from `src/hooks.server.js`
2. Set static values in `src/app.html`:
   - `<html lang="en">` (remove `%lang%`)
   - `<title>Your App Name</title>` (remove `%title%`)
   - `<meta name="description" content="Your description">` (remove
     `%description%`)
3. Set `locale` prop on `<SEO />` component manually

### Multi-Language Routing Strategies

**Path-based** (recommended):
- `/en/about`, `/nl/over-ons`, `/es/acerca-de`
- Language in URL path
- Easy for users to share/bookmark

**Domain-based**:
- `example.com` (English), `example.nl` (Dutch)
- Requires custom domain handling in hooks

**Subdomain-based**:
- `en.example.com`, `nl.example.com`
- Requires custom subdomain handling

### Compatibility with SvelteKit Adapters

The language detection system works with all SvelteKit adapters:

**SSR Adapters** (adapter-node, adapter-vercel, etc.):
- Uses `handleLang` in hooks → sets `locals` → HTML injection
- Language detected server-side for optimal SEO
- `<html lang="">` set before HTML is sent to client

**Static Adapter** (adapter-static):
- `handleLang` runs during prerendering
- Client-side fallback detects language from URL
- Works offline after initial load
- Prerender each language separately: `/en/`, `/nl/`, etc.

**Client-Only Apps**:
- Remove `handleLang` from hooks
- Language detected client-side from URL in `+layout.js`
- Set static values in `app.html`: `<html lang="en">`, `<title>App
  Name</title>`, `<meta name="description" content="...">`

All approaches maintain proper SEO with `og:locale` tags.

## Technical Details

### Imagetools Integration

Source images are processed automatically using imagetools query parameters:

- **`?favicons`**: Generates browser and PWA icons (16, 32, 192, 512)
  - Used by: `Favicons.svelte`
  - Source: `favicon.png` (512×512 or larger recommended)
- **`?apple-touch-icons`**: Generates iOS-specific icons
  (120, 152, 167, 180)
  - Used by: `Favicons.svelte`
  - Source: `favicon.png`
- **`?seo-landscape`**: Generates landscape SEO image (1200×630)
  - Used by: Imported in `config.js` as `SeoImageLandscape`
  - Source file: `preview-landscape.png`
- **`?seo-square`**: Generates square SEO image (1200×1200)
  - Used by: Imported in `config.js` as `SeoImageSquare`
  - Source file: `preview-square.png`

No manual size configuration needed - preprocessors automatically resize and
optimize images to the correct dimensions.

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

// SEO social media preview images
// Import and export to enable, or set to null to disable
import SeoLandscapeImg from './preview-landscape.png?seo-landscape';
import SeoSquareImg from './preview-square.png?seo-square';
export const SeoImageLandscape = SeoLandscapeImg;  // 1200×630
export const SeoImageSquare = SeoSquareImg;        // 1200×1200

// To disable: comment out imports and set to null
// export const SeoImageLandscape = null;
// export const SeoImageSquare = null;

// Site routes and robots.txt configuration
// @see @hkdigital/lib-core/meta/README.md
export const siteRoutes = ['/'];
export const robotsConfig = {
  allowedHosts: '*',
  disallowedPaths: [],
  allowAiTraining: true,
  allowAiReading: true
};
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

### SEO Meta Tags (SEO.svelte)

Generates SEO and social media meta tags using configuration from
`config.js`.

**Note:** The SEO component handles both search engine optimization (meta
description, canonical URLs, robots directives, hreflang) and social media
previews (Open Graph tags). These are combined because they share most
properties and are both essential for page discoverability.

Automatically uses optimized landscape and square images for social media
previews:

```svelte
<script>
  import {
    name as defaultTitle,
    description as defaultDescription,
    SeoImageLandscape,
    SeoImageSquare,
    defaultLocale,
    languages
  } from './config.js';

  // Use the landscape image as default (best for most platforms)
  const defaultSeoImage = SeoImageLandscape || undefined;

  let {
    title = defaultTitle,
    description = defaultDescription,
    url = undefined,
    image = defaultSeoImage,
    imageAlt = title,
    type = 'website',
    locale = undefined,
    siteName = defaultTitle,
    data = undefined,
    alternateUrls = undefined,
    robots = undefined,
    noAiTraining = false
  } = $props();

  const finalLocale = data?.locale || locale || defaultLocale;
</script>

<svelte:head>
  <!-- Page title (overrides %title% from app.html) -->
  <title>{title}</title>

  <!-- Basic SEO -->
  <meta name="description" content={description}>

  <!-- Open Graph / Facebook / LinkedIn / Discord -->
  <meta property="og:type" content={type}>
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:site_name" content={siteName}>
  <meta property="og:locale" content={finalLocale}>

  {#if url}
    <meta property="og:url" content={url}>
    <link rel="canonical" href={url}>
  {/if}

  {#if image}
    <meta property="og:image" content={image}>
    <meta property="og:image:alt" content={imageAlt}>
    <!-- Image metadata (dimensions from preprocessor) -->
    {#if image === SeoImageLandscape}
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:type" content="image/jpeg">
    {/if}
  {/if}

  <!-- Additional square image for platforms that prefer it -->
  {#if SeoImageSquare && SeoImageSquare !== image}
    <meta property="og:image" content={SeoImageSquare}>
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="1200">
    <meta property="og:image:type" content="image/jpeg">
  {/if}
</svelte:head>
```

**Note**: The component includes both landscape and square images as separate
`og:image` tags. Social media platforms will automatically select the aspect
ratio that best fits their display requirements.

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
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <title>%title%</title>
    <meta name="description" content="%description%">
    %sveltekit.head%
  </head>
  <body data-theme="hkdev" data-sveltekit-preload-data="hover">
    <div data-label="sveltekit-body">%sveltekit.body%</div>
  </body>
</html>
```

**Placeholders:**
- `%lang%` - Replaced with language code from URL (e.g., `en-GB`)
- `%title%` - Replaced with `name` from config.js
- `%description%` - Replaced with `description` from config.js
- `%sveltekit.head%` - Replaced with meta tags from components
- `%sveltekit.body%` - Replaced with page content

All favicon links, PWA meta tags, and manifest configuration are injected
through `%sveltekit.head%` via the `<Favicons />`, `<PWA />`, and `<SEO />`
components in the root layout. This keeps the base HTML template clean and
makes all meta configuration dynamic and maintainable through
JavaScript/Svelte.

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
