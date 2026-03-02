// @see https://www.sitemaps.org/protocol.html

/** @typedef {import('./typedef.js').SitemapRoute} SitemapRoute */
/** @typedef {import('./typedef.js').SitemapRouteObject} SitemapRouteObject */

/**
 * Normalize route to full route object with defaults
 *
 * @param {import('./typedef.js').SitemapRoute} route - Route path string or route object
 *
 * @returns {SitemapRouteObject} Normalized route object
 */
function normalizeRoute(route) {
  // Handle simple string format
  if (typeof route === 'string') {
    return {
      path: route,
      priority: route === '/' ? 1.0 : 0.8,
      changefreq: route === '/' ? 'daily' : 'weekly'
    };
  }

  // Handle object format with defaults
  return {
    priority: 0.8,
    changefreq: 'weekly',
    ...route
  };
}

/**
 * Generate sitemap XML
 *
 * @param {string} origin - Base URL (e.g., https://example.com)
 * @param {SitemapRoute[]} [routes=[]] - Array of routes
 *
 * @returns {string} XML sitemap
 */
export function generateSitemap(origin, routes = []) {
  // Ensure root path is always included (failsafe)
  const hasRoot = routes.some((route) => {
    const path = typeof route === 'string' ? route : route.path;
    return path === '/';
  });

  const normalizedRoutes = hasRoot ? routes : ['/', ...routes];

  const urls = normalizedRoutes
    .map(normalizeRoute)
    .map(
      (route) => `
  <url>
    <loc>${origin}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}
