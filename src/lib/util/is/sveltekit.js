/**
 * Check if object is a SvelteKit HttpError
 *
 * @param {any} thing
 *
 * @returns {boolean}
 */
export function SveltekitHttpError(thing) {
  return Boolean(
    thing instanceof Object &&
      thing.constructor?.name === 'HttpError' &&
      'status' in thing
  );
}
