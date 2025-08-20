export class TypeOrValueError extends Error {}

export class InternalError extends Error {}

export class InternalEventOrLogError extends Error {}

export class DetailedError extends Error
{
  /**
   * @param {string} [message]
   * @param {import('./typedef.js').ErrorDetails} [details] - Additional details
   * @param {Error|null} [cause] - Original error
   */
  constructor(message, details, cause ) {
    super(message);
    this.name = 'DetailedError';
    this.details = details ?? null;

    if( cause )
    {
      if( cause instanceof Error )
      {
        this.cause = cause;
      }
      else {
        throw new Error('Parameter [cause] should be an Error');
      }
    }
  }
}
