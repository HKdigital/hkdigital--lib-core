# Meta Utilities

SEO and meta tag utilities for robots.txt and sitemap.xml generation.

## Overview

This module provides functions for generating robots.txt and sitemap.xml
files dynamically based on configuration. The utilities are used by the
`routes/(meta)` endpoints but can also be used independently in your own
server routes.

## Modules

### Robots

Generate robots.txt content with host filtering and sitemap references.

```javascript
import { generateRobotsTxt, isHostAllowed } from '$lib/meta/robots.js';
```

### Sitemap

Generate sitemap.xml content from route configurations.

```javascript
import { generateSitemap } from '$lib/meta/sitemap.js';
```

## Usage

### Robots.txt Generation

The `generateRobotsTxt()` function creates robots.txt content based on the
request URL and configuration.

**Basic usage:**

```javascript
import { generateRobotsTxt } from '$lib/meta/robots.js';

export const GET = async ({ url }) => {
  const config = {
    allowedHosts: ['example.com', 'www.example.com'],
    disallowedPaths: ['/admin', '/api']
  };

  const robotsTxt = generateRobotsTxt(url, config);
  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
```

**Configuration options:**

```javascript
/**
 * @typedef {Object} RobotsConfig
 * @property {string[] | '*'} [allowedHosts]
 *   Allowed host patterns. Use '*' or omit to allow all hosts.
 *   Supports wildcards (e.g., '*.example.com')
 * @property {string[]} [disallowedPaths]
 *   Paths to block from indexing (e.g., '/admin', '/api/*')
 */
```

**Host filtering:**

```javascript
// Allow only production domain
const config = {
  allowedHosts: ['example.com']
};

// example.com → User-agent: *\nAllow: /\nSitemap: ...
// test.example.com → User-agent: *\nDisallow: /
```

**Wildcard patterns:**

```javascript
// Allow all subdomains
const config = {
  allowedHosts: ['example.com', '*.example.com']
};

// example.com → allowed
// test.example.com → allowed
// staging.example.com → allowed
```

**Path blocking:**

```javascript
// Block specific paths
const config = {
  allowedHosts: ['example.com'],
  disallowedPaths: ['/admin', '/api', '/private/*']
};

// Generates:
// User-agent: *
// Allow: /
// Disallow: /admin
// Disallow: /api
// Disallow: /private/*
// Sitemap: https://example.com/sitemap.xml
```

**Sitemap reference:**

Sitemap reference is always included for allowed hosts:

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

### Sitemap.xml Generation

The `generateSitemap()` function creates sitemap.xml content from route
configurations.

**Basic usage:**

```javascript
import { generateSitemap } from '$lib/meta/sitemap.js';

export const GET = async ({ url }) => {
  const routes = ['/', '/about', '/contact'];

  const sitemap = generateSitemap(url.origin, routes);
  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
```

**Route configuration:**

```javascript
/**
 * @typedef {string | SitemapRouteObject} SitemapRoute
 *   Route can be a simple string path or an object with details
 */

/**
 * @typedef {Object} SitemapRouteObject
 * @property {string} path - Route path (e.g., '/about')
 * @property {number} [priority] - Priority (0.0 to 1.0)
 * @property {'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'}
 *   [changefreq] - Change frequency
 */
```

**Simple format (recommended):**

```javascript
const routes = [
  '/',        // priority: 1.0, changefreq: 'daily'
  '/about',   // priority: 0.8, changefreq: 'weekly'
  '/contact'  // priority: 0.8, changefreq: 'weekly'
];
```

**Advanced format with custom settings:**

```javascript
const routes = [
  '/',
  '/about',
  { path: '/blog', priority: 0.9, changefreq: 'daily' },
  { path: '/legal', priority: 0.3, changefreq: 'yearly' }
];
```

**Mixed format:**

```javascript
const routes = [
  '/',
  '/about',
  { path: '/blog', priority: 0.9, changefreq: 'daily' },
  '/contact'
];
```

**Default values:**

- Root path (`/`): priority `1.0`, changefreq `daily`
- Other paths: priority `0.8`, changefreq `weekly`
- Root path is always included (added automatically if missing)

## Helper Functions

### isHostAllowed()

Check if a hostname matches the allowed hosts configuration.

```javascript
import { isHostAllowed } from '$lib/meta/robots.js';

// Exact match
isHostAllowed('example.com', ['example.com']); // true
isHostAllowed('test.example.com', ['example.com']); // false

// Wildcard match
isHostAllowed('test.example.com', ['*.example.com']); // true
isHostAllowed('example.com', ['*.example.com']); // false

// Allow all
isHostAllowed('anything.com', '*'); // true
isHostAllowed('anything.com', undefined); // true

// Multiple patterns
isHostAllowed('example.com', ['example.com', '*.staging.com']); // true
isHostAllowed('app.staging.com', ['example.com', '*.staging.com']); // true
```

**Case insensitive:**

```javascript
isHostAllowed('Example.COM', ['example.com']); // true
```

**String or array:**

```javascript
// Single string
isHostAllowed('example.com', 'example.com'); // true

// Array
isHostAllowed('example.com', ['example.com']); // true
```

## Real-World Examples

### Production-only indexing

```javascript
// Only allow production domain to be indexed
const robotsConfig = {
  allowedHosts: ['mysite.com', 'www.mysite.com'],
  disallowedPaths: ['/admin', '/api']
};

// Production: mysite.com → Allow + Sitemap
// Staging: staging.mysite.com → Disallow
// Development: localhost → Disallow
```

### Staging and production indexing

```javascript
// Allow both production and staging subdomains
const robotsConfig = {
  allowedHosts: ['mysite.com', '*.mysite.com'],
  disallowedPaths: ['/admin', '/api']
};

// Production: mysite.com → Allow + Sitemap
// Staging: staging.mysite.com → Allow + Sitemap
// Development: localhost → Disallow
```

### Allow all hosts (development)

```javascript
// Allow all hosts - useful during development
const robotsConfig = {
  allowedHosts: '*',
  disallowedPaths: ['/admin']
};

// All hosts → Allow + Sitemap
```

### Complex sitemap configuration

```javascript
const routes = [
  '/',
  '/about',
  '/contact',

  // Blog updated frequently
  { path: '/blog', priority: 0.9, changefreq: 'daily' },

  // Legal pages rarely change
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms', priority: 0.3, changefreq: 'yearly' },

  // Documentation moderately important
  { path: '/docs', priority: 0.7, changefreq: 'monthly' }
];
```

## Integration with Routes

These utilities are used by the `routes/(meta)` endpoints:

### robots.txt endpoint

```javascript
// routes/(meta)/robots.txt/+server.js
import { text } from '@sveltejs/kit';
import { generateRobotsTxt } from '$lib/meta/robots.js';
import { robotsConfig } from '../config.js';

export const GET = async ({ url }) => {
  const robotsTxt = generateRobotsTxt(url, robotsConfig);
  return text(robotsTxt);
};
```

### sitemap.xml endpoint

```javascript
// routes/(meta)/sitemap.xml/+server.js
import { generateSitemap } from '$lib/meta/sitemap.js';
import { siteRoutes } from '../config.js';

export const GET = async ({ url }) => {
  const sitemap = generateSitemap(url.origin, siteRoutes);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};
```

## Reverse Proxy Configuration

If your app is deployed behind a reverse proxy (nginx, Cloudflare, etc.),
ensure your SvelteKit adapter is configured to trust proxy headers for
correct origin detection:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      // Trust X-Forwarded-* headers from proxy
      trustProxy: true
    })
  }
};
```

Without this, `url.origin` may be `http://localhost` instead of your actual
domain, and the sitemap directive will point to the wrong URL.

## Testing

Unit tests are included for all functions:

```bash
# Run meta utility tests
pnpm test:file src/lib/meta/

# Test coverage includes:
# - Host pattern matching (exact, wildcard, multiple)
# - Robots.txt generation (allowed/blocked hosts, paths, sitemap)
# - Sitemap generation (simple/advanced routes, defaults, mixed formats)
```

## Type Definitions

TypeScript-style JSDoc type definitions are available:

```javascript
// robots.js
import './robots/typedef.js';  // RobotsConfig

// sitemap.js
import './sitemap/typedef.js';  // SitemapRoute, SitemapRouteObject
```

See `typedef.js` files in each subdirectory for complete type definitions.
