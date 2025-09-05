import { DetailedError } from '$lib/generic/errors.js';

/**
 * Creates a new Error from the error message and throws it with a reference
 * to the originating Error
 * - The originating Error is set as `cause` property
 *
 * @param {string} message - New error message
 * @param {Error|string|any} originalErrorOrMessage
 * @param {string|Object.<string, any>|null} [details]
 *   New error details (a DetailError will be thrown)
 *
 * @throws {DetailedError}
 *
 * @returns {never} This function never returns
 */
export function rethrow(message, originalErrorOrMessage, details) {
  let error;

  if (typeof originalErrorOrMessage === 'string') {
    // Convert non-Error values to Error objects
    error = new Error(originalErrorOrMessage);
  } else if (originalErrorOrMessage instanceof Error) {
    error = originalErrorOrMessage;
  } else {
    throw new DetailedError(
      'rethrow: invalid parameter [originalErrorOrMessage]',
      { originalErrorOrMessage, details }
    );
  }

  throw new DetailedError(message, details, error);
}
