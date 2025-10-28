export * from './info/device.js';
export * from './info/display.js';
export * from './info/engine.js';
export * from './info/language.js';
export * from './info/system.js';
export * from './info/timezone.js';

import { getDeviceType, getIsMobile } from './info/device.js';
import { getBrowserName, getBrowserEngine } from './info/engine.js';

import {
  getScreenSize,
  getViewportSize,
  getDevicePixelRatio,
  getOrientation,
  hasTouchSupport,
  getIsPwa
} from './info/display.js';

import { getLanguage } from './info/language.js';
import { getPlatform, getCpuCores, getConnectionType } from './info/system.js';
import { getTimezone } from './info/timezone.js';

/**
 * @typedef {{
 *   deviceType?: boolean,
 *   isMobile?: boolean,
 *   platform?: boolean,
 *   browser?: boolean,
 *   browserEngine?: boolean,
 *   screenWidth?: boolean,
 *   screenHeight?: boolean,
 *   devicePixelRatio?: boolean,
 *   hasTouch?: boolean,
 *   language?: boolean,
 *   timezone?: boolean,
 *   isPwa?: boolean,
 *   viewportWidth?: boolean,
 *   viewportHeight?: boolean,
 *   orientation?: boolean,
 *   cpuCores?: boolean,
 *   connectionType?: boolean
 * }} BrowserInfoOptions
 */

/**
 * @typedef {import('./typedef.js').BrowserInfo} BrowserInfo
 */

/**
 * Collect browser and device information for analytics/stats
 *
 * @param {BrowserInfoOptions} [options] - Enable/disable individual properties
 *
 * @returns {BrowserInfo} collected browser information
 *
 * @example
 * // Get all essential info (default)
 * const info = getBrowserInfo();
 *
 * @example
 * // Get only specific properties
 * const info = getBrowserInfo({
 *   deviceType: true,
 *   platform: true,
 *   browser: true
 * });
 *
 * @example
 * // Get essential + extended properties
 * const info = getBrowserInfo({
 *   deviceType: true,
 *   platform: true,
 *   viewportWidth: true,
 *   viewportHeight: true,
 *   orientation: true,
 *   cpuCores: true
 * });
 */
export function getBrowserInfo(options = {}) {
  // Default to BrowserInfoEssential properties
  const {
    deviceType = true,
    isMobile = true,
    platform = true,
    browser = true,
    browserEngine = true,
    screenWidth = true,
    screenHeight = true,
    devicePixelRatio = true,
    hasTouch = true,
    language = true,
    timezone = true,
    isPwa = true,
    // Extended properties (default false)
    viewportWidth = false,
    viewportHeight = false,
    orientation = false,
    cpuCores = false,
    connectionType = false
  } = options;

  const info = {};

  // Device type
  if (deviceType) {
    info.deviceType = getDeviceType();
  }

  // Mobile check
  if (isMobile) {
    info.isMobile = getIsMobile();
  }

  // Platform
  if (platform) {
    info.platform = getPlatform();
  }

  // Browser name
  if (browser) {
    info.browser = getBrowserName();
  }

  // Browser engine
  if (browserEngine) {
    info.browserEngine = getBrowserEngine();
  }

  // Screen dimensions
  if (screenWidth || screenHeight) {
    const screenSize = getScreenSize();
    if (screenWidth) info.screenWidth = screenSize.width;
    if (screenHeight) info.screenHeight = screenSize.height;
  }

  // Device pixel ratio
  if (devicePixelRatio) {
    info.devicePixelRatio = getDevicePixelRatio();
  }

  // Touch support
  if (hasTouch) {
    info.hasTouch = hasTouchSupport();
  }

  // Language
  if (language) {
    info.language = getLanguage();
  }

  // Timezone
  if (timezone) {
    info.timezone = getTimezone();
  }

  // PWA
  if (isPwa) {
    info.isPwa = getIsPwa();
  }

  // Viewport dimensions (extended)
  if (viewportWidth || viewportHeight) {
    const viewportSize = getViewportSize();
    if (viewportWidth) info.viewportWidth = viewportSize.width;
    if (viewportHeight) info.viewportHeight = viewportSize.height;
  }

  // Orientation (extended)
  if (orientation) {
    info.orientation = getOrientation();
  }

  // CPU cores (extended)
  if (cpuCores) {
    info.cpuCores = getCpuCores();
  }

  // Connection type (extended)
  if (connectionType) {
    info.connectionType = getConnectionType();
  }

  return info;
}
