/**
 * Check if the app is running as a PWA
 *
 * @returns {boolean} true if running as PWA
 */
export function getIsPwa() {
  return window.matchMedia(
    '(display-mode: fullscreen) or (display-mode: standalone)'
  ).matches;
}

/**
 * Check if window is in fullscreen mode
 *
 * @returns {boolean} true if fullscreen
 */
export function getIsFullscreen() {
  if (getIsPwa()) {
    return true;
  } else if (document.fullscreenElement) {
    // Safari
    return true;
  }

  return false;
}

/**
 * Get screen dimensions (physical screen size)
 *
 * @example
 * // Desktop: {width: 1920, height: 1080}
 * // iPhone 14: {width: 390, height: 844}
 * // iPad Pro: {width: 1024, height: 1366}
 *
 * @returns {{width: number, height: number}} screen dimensions
 */
export function getScreenSize() {
  return {
    width: window.screen.width,
    height: window.screen.height
  };
}

/**
 * Get viewport dimensions (visible browser area)
 *
 * @example
 * // Full screen: {width: 1920, height: 1080}
 * // Windowed: {width: 1200, height: 800}
 * // Mobile with address bar: {width: 390, height: 750}
 *
 * @returns {{width: number, height: number}} viewport dimensions
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Get screen orientation
 *
 * @example
 * // Phone held upright: 'portrait'
 * // Phone rotated: 'landscape'
 * // Desktop: 'landscape'
 *
 * @returns {'portrait'|'landscape'} screen orientation
 */
export function getOrientation() {
  return window.matchMedia('(orientation: portrait)').matches
    ? 'portrait'
    : 'landscape';
}

/**
 * Get device pixel ratio (retina displays have higher values)
 *
 * @example
 * // Standard display: 1
 * // Retina/High-DPI: 2 or 3
 * // iPhone 14 Pro: 3
 *
 * @returns {number} device pixel ratio
 */
export function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device has touch support
 *
 * @example
 * // Mobile phones/tablets: true
 * // Desktop with touch screen: true
 * // Desktop without touch: false
 *
 * @returns {boolean} true if touch is supported
 */
export function hasTouchSupport() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}
