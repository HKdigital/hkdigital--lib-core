/**
 * Essential browser info
 *
 * @typedef {{
 *   deviceType?: 'phone'|'tablet'|'tv'|'desktop',
 *   isMobile?: boolean,
 *   platform?: string,
 *   browser?: string,
 *   browserEngine?: 'blink'|'gecko'|'webkit'|'unknown',
 *   screenWidth?: number,
 *   screenHeight?: number,
 *   devicePixelRatio?: number,
 *   hasTouch?: boolean,
 *   language?: string,
 *   timezone?: string,
 *   isPwa?: boolean
 * }} BrowserInfoEssential
 */

/**
 * Extended browser info (opt-in)
 *
 * @typedef {{
 *   viewportWidth?: number,
 *   viewportHeight?: number,
 *   orientation?: 'portrait'|'landscape',
 *   cpuCores?: number,
 *   connectionType?: string|null
 * }} BrowserInfoExtended
 */

/**
 * Complete browser info (essential + extended)
 *
 * @typedef {BrowserInfoEssential & BrowserInfoExtended} BrowserInfo
 */

export {};
