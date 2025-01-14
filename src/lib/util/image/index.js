/**
 * Returns the unchanged image meta object or the last item of
 * an array of ImageMeta objects. This is assumed to be a list
 * of sorted responsive image formats, so it should be the
 * largest image.
 *
 * @param {ImageMeta|ImageMeta[]} imageMeta
 */
export function toSingleImageMeta(imageMeta) {
  if (Array.isArray(imageMeta)) {
    if (!imageMeta.length) {
      throw new Error('List of ImageMeta objects is empty');
    }
    imageMeta = imageMeta[imageMeta.length - 1];
  }

  if (typeof imageMeta === 'object') {
    return imageMeta;
  } else if (!imageMeta) {
    throw new Error('Missing [imageMeta]');
  }

  throw new Error('Invalid value for parameter [imageMeta]');
}
