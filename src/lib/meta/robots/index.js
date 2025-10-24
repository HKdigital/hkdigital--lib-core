/** @typedef {import('./typedef.js').RobotsConfig} RobotsConfig */

/**
 * Check if hostname matches allowed hosts pattern
 *
 * @param {string} hostname - Hostname to check (e.g., test.mysite.com)
 * @param {string[] | '*' | undefined} allowedHosts - Allowed host patterns
 *
 * @returns {boolean} True if host is allowed
 */
export function isHostAllowed(hostname, allowedHosts) {
  // If not configured or set to '*', allow all hosts
  if (!allowedHosts || allowedHosts === '*') {
    return true;
  }

  if (typeof allowedHosts === 'string') {
    allowedHosts = [allowedHosts];
  }

  // Check if hostname matches any allowed pattern
  return allowedHosts.some((pattern) => {
    // Convert wildcard pattern to regex
    // Example: *.mysite.com -> ^.*\.mysite\.com$
    const regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*/g, '.*'); // * becomes .*

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(hostname);
  });
}

/**
 * Generate robots.txt with sitemap reference
 *
 * NOTE: If deployed behind a reverse proxy (nginx, Cloudflare, etc.),
 * ensure your adapter is configured to trust proxy headers for correct
 * origin detection:
 *
 * // svelte.config.js
 * export default {
 *   kit: {
 *     adapter: adapter({
 *       // Trust X-Forwarded-* headers from proxy
 *       trustProxy: true
 *     })
 *   }
 * };
 *
 * Without this, url.origin may be http://localhost instead of your
 * actual domain, and the sitemap directive will be omitted.
 *
 * @param {URL} url - Request URL object
 * @param {RobotsConfig} [config] - Robots configuration object
 *
 * @returns {string} robots.txt content
 */
export function generateRobotsTxt(url, config = {}) {
  const hostAllowed = isHostAllowed(url.hostname, config.allowedHosts);

  // Block entire site if host is not allowed
  if (!hostAllowed) {
    return 'User-agent: *\nDisallow: /';
  }

  // Allow site, but add specific path blocks
  let content = 'User-agent: *\nAllow: /';

  // Add disallowed paths
  if (config.disallowedPaths && config.disallowedPaths.length > 0) {
    config.disallowedPaths.forEach((path) => {
      content += `\nDisallow: ${path}`;
    });
  }

  // Add sitemap reference if enabled and origin is available
  if (url.origin && config.includeSitemap !== false) {
    content += `\nSitemap: ${url.origin}/sitemap.xml`;
  }

  return content;
}
