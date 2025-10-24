// @see https://developer.mozilla.org/en-US/docs/
//        Web/Progressive_web_apps/Manifest/Reference

import {
  name,
  shortName,
  description,
  backgroundAndThemeColor,
  orientation
} from '../config.js';

import faviconImages from '../favicon.png?favicons';

/* Generate manifest data */

const manifest = {
  name,
  short_name: shortName,
  description,

  start_url: '/',
  scope: '/',

  icons: faviconImages.map((item) => {
    return {
      src: item.src,
      sizes: `${item.width}x${item.width}`,
      type: 'image/png'
    };
  }),

  theme_color: backgroundAndThemeColor,
  background_color: backgroundAndThemeColor,

  display: 'fullscreen',
  orientation
};

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async () => {
  return new Response(JSON.stringify(manifest));
};
