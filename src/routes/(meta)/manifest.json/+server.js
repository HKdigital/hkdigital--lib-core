// @see https://developer.mozilla.org/en-US/docs/
//        Web/Progressive_web_apps/Manifest/Reference

/* Icon sources */

// @ts-ignore
import favicon192 from '../favicon.png?w=192&format=png';

// @ts-ignore
import favicon512 from '../favicon.png?w=512&format=png';

let sources = [
  { size: 192, url: favicon192[0].src },
  { size: 512, url: favicon512[0].src }
];

/* Config */

const name = 'HKdigital Lib Core Test';
const shortName = 'HKlib Core';

const description = 'Base library that powers up Sveltekit projects';

const backgroundAndThemeColor = '#082962';

const orientation = 'any';
//const orientation = "landscape";

/* Gnerate manifest data */

const manifest = {
  name,
  short_name: shortName,
  description,

  start_url: '/',
  scope: '/',

  icons: sources.map((item) => {
    return {
      src: item.url,
      sizes: `${item.size}x${item.size}`,
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
