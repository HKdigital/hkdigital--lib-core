/**
 * Creates a new Error from the error message and throws it with a reference
 * to the originating Error
 * - The originating Error is set as `cause` property
 *
 * @param {string} message - Additional message to prepend
 * @param {Error|string} error - Original error
 *
 * @throws {Error}
 */
export function rethrow(message, error) {
  if (!(error instanceof Error)) {
    // Convert non-Error values to Error objects
    error = new Error(String(error));
  }
  throw new Error(message, { cause: error });
}
