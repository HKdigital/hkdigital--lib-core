export class TypeOrValueError extends Error {}

export class InternalError extends Error {}

export class InternalEventOrLogError extends Error {}

export class DetailedError extends Error
{
  /**
   * @param {string} message - Error message
   * @param {string|{[key: string]: any}|null} [details] - Additional details
   * @param {Error|string} [cause] - Original error
   */
  constructor(message, details, cause ) {
    super(message);
    this.name = 'DetailedError';
    this.details = details ?? null;
    this.cause = cause;
  }
}
