export const ERROR_WINDOW_SIZE_NOT_LANDSCAPE = 'Window size is not landsccape';

export const ERROR_WINDOW_SIZE_NOT_PORTRAIT = 'Window size is not portrait';

/**
 * Check if the device is running iOS (iPhone, iPod, or iPad)
 *
 * @returns {boolean} true if iOS device
 */
export function isIOS() {
  if (/iPad|iPhone|iPod/.test(navigator.platform)) {
    return true;
  } else {
    return navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform);
  }
}

/**
 * Check if the device is running iPadOS
 *
 * @returns {boolean} true if iPadOS device
 */
export function isIpadOS() {
  return navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform);
}

/**
 * Get the operating system of the device
 *
 * @returns {'iOS'|'Android'|'unknown'} operating system
 */
export function getOS() {
  if (isIOS()) {
    return 'iOS';
  } else if (/Android/.test(navigator.userAgent)) {
    return 'Android';
  } else {
    return 'unknown';
  }
}

/**
 * Check if the device is a mobile phone or tablet
 *
 * @returns {boolean} true if mobile device
 */
export function getIsMobile() {
  // @ts-ignore
  if (navigator?.userAgentData?.mobile !== undefined) {
    // Supports for mobile flag
    // @ts-ignore
    return navigator.userAgentData.mobile;
  } else if (isIOS()) {
    return true;
  } else if (/Android/.test(navigator.userAgent)) {
    return true;
  }

  return false;
}

/**
 * Get game width for landscape mode
 *
 * @param {object} _
 * @param {number} _.windowWidth
 * @param {number} _.windowHeight
 * @param {number} [_.aspectOnLandscape]
 *
 * @returns {number} game width
 */
export function getGameWidthOnLandscape({
  windowWidth,
  windowHeight,
  aspectOnLandscape
}) {
  if (!windowHeight) {
    return 0;
  }

  if (windowWidth < windowHeight) {
    throw new Error(ERROR_WINDOW_SIZE_NOT_LANDSCAPE);
  }

  if (!aspectOnLandscape) {
    // No game aspect specified for landscape
    // => return full width
    return windowWidth;
  }

  const windowAspect = windowWidth / windowHeight;

  if (windowAspect > aspectOnLandscape) {
    // aspect of window if wider than game aspect => fill height
    return aspectOnLandscape * windowHeight;
  } else {
    // aspect of game is wider => fill width
    return windowWidth;
  }
}

/**
 * Get game width for portrait mode
 *
 * @param {object} _
 * @param {number} _.windowWidth
 * @param {number} _.windowHeight
 * @param {number} [_.aspectOnPortrait]
 *
 * @returns {number} game width
 */
export function getGameWidthOnPortrait({
  windowWidth,
  windowHeight,
  aspectOnPortrait
}) {
  if (!windowHeight) {
    return 0;
  }

  if (windowHeight < windowWidth) {
    throw new Error(ERROR_WINDOW_SIZE_NOT_PORTRAIT);
  }

  if (!aspectOnPortrait) {
    // No game aspect specified for portrait
    // => return full width
    return windowWidth;
  }

  const windowAspect = windowWidth / windowHeight;

  if (windowAspect > aspectOnPortrait) {
    // aspect of window if wider than game aspect => fill height
    return aspectOnPortrait * windowHeight;
  } else {
    // aspect of game is wider => fill width
    return windowWidth;
  }
}
