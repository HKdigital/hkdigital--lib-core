/**
 * Returns the unchanged image meta object or the last item of
 * an array of ImageMeta objects. This is assumed to be a list
 * of sorted responsive image formats, so it should be the
 * largest image.
 *
 * @param {import('../../typedef.js').ImageSource} imageSource
 */
export function toSingleImageMeta(imageSource) {
  if (Array.isArray(imageSource)) {
    if (!imageSource.length) {
      throw new Error('List of ImageMeta objects is empty');
    }
    imageSource = imageSource[imageSource.length - 1];
  }

  if (typeof imageSource === 'object') {
    return imageSource;
  } else if (!imageSource) {
    throw new Error('Missing [imageSource]');
  }

  throw new Error('Invalid value for parameter [imageSource]');
}

/**
 * Calculate effective width based on container dimensions and fit mode
 *
 * @param {object} params
 * @param {number} [params.containerWidth] Container width in pixels
 * @param {number} [params.containerHeight] Container height in pixels
 * @param {number} params.imageAspectRatio Original image aspect ratio (width/height)
 * @param {'cover'|'contain'|'fill'} [params.fit='contain'] Fit mode
 * @returns {number} Effective width needed
 */
export function calculateEffectiveWidth({
  containerWidth,
  containerHeight,
  imageAspectRatio,
  fit = 'contain'
}) {
  if (containerWidth && !containerHeight) {
    // If only width is provided, use it

    return containerWidth;
  }

  if (!containerWidth && containerHeight) {
    // If only height is provided, calculate width based on aspect ratio

    return containerHeight * imageAspectRatio;
  }

  if (containerWidth && containerHeight) {
    // If both dimensions are provided, calculate based on fit mode

    const containerAspectRatio = containerWidth / containerHeight;

    switch (fit) {
      case 'fill':
        return containerWidth;

      case 'contain':
        if (containerAspectRatio > imageAspectRatio) {
          // Height constrained, scale width accordingly

          return containerHeight * imageAspectRatio;
        }
        return containerWidth;

      case 'cover':
        if (containerAspectRatio < imageAspectRatio) {
          // Height constrained, scale width accordingly

          return containerHeight * imageAspectRatio;
        }
        return containerWidth;

      default:
        return containerWidth;
    }
  }

  // Fallback if neither dimension is provided
  throw new Error('Either containerWidth or containerHeight must be provided');
}
