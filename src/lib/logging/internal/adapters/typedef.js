/**
 * @typedef {Object} ErrorSummaryMeta
 * @property {string} category - Error category (rethrow, validation, http, promise, error)
 * @property {string} method - Specific method (rethrow, expect, httpGet, hkpromise.timeout, etc)
 * @property {string} [origin] - User function name where error originated
 * @property {number} [relevantFrameIndex] - Index of most relevant stack frame to highlight
 */

/**
 * @typedef {Object} ErrorSummary
 * @property {string} name - The name of the exception/error
 * @property {string} message - The error message
 * @property {ErrorSummaryMeta} [meta] - Error meta
 * @property {string} [stack] Stack trace (in debug mode for first exception)
 * @property {number} [status] - HTTP status code (for HttpError instances)
 * @property {*} [details] - Additional error details (for HttpError instances)
 */

 export default {};
