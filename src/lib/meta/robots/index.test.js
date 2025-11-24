import { describe, it, expect } from 'vitest';

import { isHostAllowed, generateRobotsTxt } from './index.js';

describe('isHostAllowed', () => {
  it('should allow all hosts when allowedHosts is undefined', () => {
    expect(isHostAllowed('example.com', undefined)).toBe(true);
    expect(isHostAllowed('test.example.com', undefined)).toBe(true);
    expect(isHostAllowed('anything.com', undefined)).toBe(true);
  });

  it('should allow all hosts when allowedHosts is "*"', () => {
    expect(isHostAllowed('example.com', '*')).toBe(true);
    expect(isHostAllowed('test.example.com', '*')).toBe(true);
    expect(isHostAllowed('anything.com', '*')).toBe(true);
  });

  it('should match exact hostname', () => {
    const allowedHosts = ['example.com'];
    expect(isHostAllowed('example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('test.example.com', allowedHosts)).toBe(false);
    expect(isHostAllowed('other.com', allowedHosts)).toBe(false);
  });

  it('should match wildcard subdomain patterns', () => {
    const allowedHosts = ['*.example.com'];
    expect(isHostAllowed('test.example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('staging.example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('example.com', allowedHosts)).toBe(false);
    expect(isHostAllowed('other.com', allowedHosts)).toBe(false);
  });

  it('should handle multiple allowed hosts', () => {
    const allowedHosts = ['example.com', 'test.com', '*.staging.com'];
    expect(isHostAllowed('example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('test.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('app.staging.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('other.com', allowedHosts)).toBe(false);
  });

  it('should be case insensitive', () => {
    const allowedHosts = ['example.com'];
    expect(isHostAllowed('Example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('EXAMPLE.COM', allowedHosts)).toBe(true);
    expect(isHostAllowed('example.COM', allowedHosts)).toBe(true);
  });

  it('should handle single string instead of array', () => {
    expect(isHostAllowed('example.com', 'example.com')).toBe(true);
    expect(isHostAllowed('test.example.com', 'example.com')).toBe(false);
  });

  it('should escape dots in hostname pattern', () => {
    const allowedHosts = ['example.com'];
    expect(isHostAllowed('exampleXcom', allowedHosts)).toBe(false);
  });

  it('should handle complex wildcard patterns', () => {
    const allowedHosts = ['*.*.example.com'];
    expect(isHostAllowed('app.test.example.com', allowedHosts)).toBe(true);
    expect(isHostAllowed('test.example.com', allowedHosts)).toBe(false);
  });
});

describe('generateRobotsTxt', () => {
  const mockUrl = new URL('https://example.com');

  it('should generate basic allow robots.txt for allowed host', () => {
    const config = { allowedHosts: ['example.com'] };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml'
    );
  });

  it('should generate disallow robots.txt for non-allowed host', () => {
    const config = { allowedHosts: ['other.com'] };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toBe('User-agent: *\nDisallow: /');
  });

  it('should include disallowed paths', () => {
    const config = {
      allowedHosts: ['example.com'],
      disallowedPaths: ['/admin', '/api']
    };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toContain('User-agent: *\nAllow: /');
    expect(result).toContain('\nDisallow: /admin');
    expect(result).toContain('\nDisallow: /api');
    expect(result).toContain('\nSitemap: https://example.com/sitemap.xml');
  });

  it('should always include sitemap for allowed hosts', () => {
    const config = { allowedHosts: ['example.com'] };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toContain('\nSitemap: https://example.com/sitemap.xml');
  });

  it('should work with empty config', () => {
    const result = generateRobotsTxt(mockUrl, {});

    expect(result).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml'
    );
  });

  it('should work with no config parameter', () => {
    const result = generateRobotsTxt(mockUrl);

    expect(result).toBe(
      'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml'
    );
  });

  it('should block subdomain when not in allowedHosts', () => {
    const subdomainUrl = new URL('https://test.example.com');
    const config = { allowedHosts: ['example.com'] };
    const result = generateRobotsTxt(subdomainUrl, config);

    expect(result).toBe('User-agent: *\nDisallow: /');
  });

  it('should allow subdomain with wildcard pattern', () => {
    const subdomainUrl = new URL('https://test.example.com');
    const config = { allowedHosts: ['*.example.com'] };
    const result = generateRobotsTxt(subdomainUrl, config);

    expect(result).toContain('User-agent: *\nAllow: /');
  });

  it('should handle wildcard paths in disallowedPaths', () => {
    const config = {
      allowedHosts: ['example.com'],
      disallowedPaths: ['/admin/*', '/api/*']
    };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toContain('\nDisallow: /admin/*');
    expect(result).toContain('\nDisallow: /api/*');
  });

  it('should use correct origin from URL', () => {
    const httpsUrl = new URL('https://example.com:8080/some/path');
    const config = { allowedHosts: ['example.com'] };
    const result = generateRobotsTxt(httpsUrl, config);

    expect(result).toContain(
      '\nSitemap: https://example.com:8080/sitemap.xml'
    );
  });

  it('should handle complete real-world config', () => {
    const config = {
      allowedHosts: ['mysite.com', 'www.mysite.com'],
      disallowedPaths: ['/admin', '/api', '/private/*']
    };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toBe('User-agent: *\nDisallow: /');
  });

  it('should not include disallowed paths for blocked hosts', () => {
    const config = {
      allowedHosts: ['other.com'],
      disallowedPaths: ['/admin']
    };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toBe('User-agent: *\nDisallow: /');
    expect(result).not.toContain('/admin');
  });

  it('should not include sitemap for blocked hosts', () => {
    const config = { allowedHosts: ['other.com'] };
    const result = generateRobotsTxt(mockUrl, config);

    expect(result).toBe('User-agent: *\nDisallow: /');
    expect(result).not.toContain('Sitemap:');
  });
});
