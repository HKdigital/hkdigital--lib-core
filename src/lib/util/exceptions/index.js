
import { DetailedError } from "$lib/errors/generic.js";

/**
 * Creates a new Error from the error message and throws it with a reference
 * to the originating Error
 * - The originating Error is set as `cause` property
 *
 * @param {string} message - Additional message to prepend
 * @param {Error|string} error - Original error
 * @param {string|Object.<string, any>|null} [details]
 *
 * @throws {DetailedError}
 * @returns {never} This function never returns
 */
export function rethrow(message, error, details ) {
  if (!(error instanceof Error)) {
    // Convert non-Error values to Error objects
    error = new Error(String(error));
  }

  throw new DetailedError(message, details, error );
}
