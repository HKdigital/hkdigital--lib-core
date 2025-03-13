export const ERROR_WINDOW_SIZE_NOT_LANDSCAPE = 'Window size is not landsccape';

export const ERROR_WINDOW_SIZE_NOT_PORTRAIT = 'Window size is not portrait';

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
