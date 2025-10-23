import favicon16 from './favicon.png?w=16';
import favicon32 from './favicon.png?w=32';
import favicon48 from './favicon.png?w=48';

import favicon120 from './favicon.png?w=120';
import favicon152 from './favicon.png?w=152';
import favicon167 from './favicon.png?w=167';
import favicon180 from './favicon.png?w=180';
import favicon192 from './favicon.png?w=192';
import favicon512 from './favicon.png?w=512';

/* Main configuration */

export const name = 'HKdigital Lib Core Test';
export const shortName = 'HKlib Core';  // max 12 characters

export const description = 'Base library that powers up Sveltekit projects';

export const backgroundAndThemeColor = '#082962';

export const themeColor = backgroundAndThemeColor;
export const backgroundColor = backgroundAndThemeColor;

export const statusBarStyle = 'black-translucent';

export const orientation = 'any'; // "landscape"

//
// Only disable zoom if:
// - You're building a game
// - Canvas-based app where zoom breaks functionality
// - You have a very specific technical reason...
//
export const disablePageZoom = true;

/* Generate favicon config */

/** @typedef {{ size: number, url: string }} Favicon */

export const favicons = [
  { size: 16, url: favicon16[0].src },   // classic browser tab icon
  { size: 32, url: favicon32[0].src },   // high-resolution browser support
  { size: 48, url: favicon48[0].src },   // Windows desktop shortcuts

  { size: 120, url: favicon120[0].src }, // iPhone older retina
  { size: 152, url: favicon152[0].src }, // iPad retina, iOS Safari bookmarks
  { size: 167, url: favicon167[0].src }, // iPad Pro
  { size: 180, url: favicon180[0].src }, // iPhone retina, iOS home screen
  { size: 192, url: favicon192[0].src }, // Android home screen, Chrome PWA
  { size: 512, url: favicon512[0].src }  // PWA application icon, Android splash
];

const APPLE_TOUCH_SIZES = new Set( [
  120, 152, 167, 180
] );

/** @type {Favicon[]} */
export const appleTouchIcons = favicons.reduce(
  /**
   * @param {Favicon[]} result
   * @param {Favicon} current
   * @returns {Favicon[]}
   */
  (result, current) => {
    if( APPLE_TOUCH_SIZES.has( current.size ) ) {
      result.push( current );
    }
    return result;
  },
  []
);

