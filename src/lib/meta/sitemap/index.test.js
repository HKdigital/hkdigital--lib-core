import { describe, it, expect } from 'vitest';

import { generateSitemap } from './index.js';

describe('generateSitemap', () => {
  it('should generate sitemap with simple string routes', () => {
    const routes = ['/', '/about', '/contact'];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/about</loc>');
    expect(sitemap).toContain('<loc>https://example.com/contact</loc>');
  });

  it('should set priority 1.0 and daily for root path', () => {
    const routes = ['/'];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<priority>1</priority>');
    expect(sitemap).toContain('<changefreq>daily</changefreq>');
  });

  it('should set priority 0.8 and weekly for non-root paths', () => {
    const routes = ['/about'];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<priority>0.8</priority>');
    expect(sitemap).toContain('<changefreq>weekly</changefreq>');
  });

  it('should handle object routes with custom priority and changefreq', () => {
    const routes = [
      { path: '/blog', priority: 0.9, changefreq: 'daily' },
      { path: '/legal', priority: 0.3, changefreq: 'yearly' }
    ];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<loc>https://example.com/blog</loc>');
    expect(sitemap).toContain('<priority>0.9</priority>');
    expect(sitemap).toContain('<changefreq>daily</changefreq>');

    expect(sitemap).toContain('<loc>https://example.com/legal</loc>');
    expect(sitemap).toContain('<priority>0.3</priority>');
    expect(sitemap).toContain('<changefreq>yearly</changefreq>');
  });

  it('should handle mixed string and object routes', () => {
    const routes = [
      '/',
      '/about',
      { path: '/blog', priority: 0.9, changefreq: 'daily' }
    ];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/about</loc>');
    expect(sitemap).toContain('<loc>https://example.com/blog</loc>');
    expect(sitemap).toContain('<priority>0.9</priority>');
  });

  it('should ensure root path is included when missing', () => {
    const routes = ['/about', '/contact'];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/about</loc>');
    expect(sitemap).toContain('<loc>https://example.com/contact</loc>');
  });

  it('should not duplicate root path if already included', () => {
    const routes = ['/', '/about'];
    const sitemap = generateSitemap('https://example.com', routes);

    const matches = sitemap.match(/<loc>https:\/\/example\.com\/<\/loc>/g);
    expect(matches).toHaveLength(1);
  });

  it('should handle empty routes array', () => {
    const sitemap = generateSitemap('https://example.com', []);

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
  });

  it('should handle undefined routes parameter', () => {
    const sitemap = generateSitemap('https://example.com');

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
  });

  it('should apply default values for partial object routes', () => {
    const routes = [{ path: '/custom' }];
    const sitemap = generateSitemap('https://example.com', routes);

    expect(sitemap).toContain('<loc>https://example.com/custom</loc>');
    expect(sitemap).toContain('<priority>0.8</priority>');
    expect(sitemap).toContain('<changefreq>weekly</changefreq>');
  });

  it('should handle different origins correctly', () => {
    const routes = ['/'];
    const sitemap = generateSitemap('https://subdomain.example.com', routes);

    expect(sitemap).toContain(
      '<loc>https://subdomain.example.com/</loc>'
    );
  });
});
