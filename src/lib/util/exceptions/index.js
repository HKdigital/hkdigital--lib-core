
import { DetailedError } from "$lib/errors/generic.js";

/**
 * Creates a new Error from the error message and throws it with a reference
 * to the originating Error
 * - The originating Error is set as `cause` property
 *
 * @param {string} message - New error message
 * @param {Error|string} originalError
 * @param {string|Object.<string, any>|null} [details]
 *   New error details (a DetailError will be thrown)
 *
 * @throws {DetailedError}
 * @returns {never} This function never returns
 */
export function rethrow(message, originalError, details ) {
  let error;

  if (!(originalError instanceof Error)) {
    // Convert non-Error values to Error objects
    error = new Error(String(originalError));
  }

  throw new DetailedError(message, details, error ?? originalError );
}
