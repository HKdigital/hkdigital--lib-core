/**
 * Promise-related error classes
 */

/**
 * Error class specifically for HkPromise operations
 * Provides timeout and cancelled properties with proper type safety
 */
export class PromiseError extends Error {
  /**
   * @param {string} message - Error message
   * @param {object} [options] - Error options
   * @param {boolean} [options.timeout=false] - Whether this is a timeout error
   * @param {boolean} [options.cancelled=false] - Whether this is a cancellation error
   * @param {Error|*} [options.cause] - Original error or cause
   * @param {*} [options.details] - Additional details object
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'PromiseError';
    this.timeout = options.timeout ?? false;
    this.cancelled = options.cancelled ?? false;
    this.cause = options.cause;
    this.details = options.details;
  }
}