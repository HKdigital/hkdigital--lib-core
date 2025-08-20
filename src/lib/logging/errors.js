export class LoggerError extends Error
{
  /**
   * @param {Error} originalError
   */
  constructor( originalError ) {
    super('LoggerError');
    this.name = 'LoggerError';

    if( originalError instanceof Error )
    {
      this.cause = originalError;
    }
    else {
      throw new Error('Parameter [originalError] should be an Error');
    }
  }
}
