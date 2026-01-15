import { generateSitemap } from '@hkdigital/lib-core/meta/sitemap.js';
import { siteRoutes } from '../config.js';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async ({ url }) => {
  const sitemap = generateSitemap(url.origin, siteRoutes);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};
