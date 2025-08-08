export class HttpError extends Error
{
  /**
   * @param {number} status - HTTP status
   * @param {string} message - Error message
   * @param {string|{[key: string]: any}|null} [details] - Additional details
   * @param {Error|string} [cause] - Original error
   */
  constructor(status, message, details, cause ) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
    this.details = details ?? null;
    this.cause = cause;
  }
}
