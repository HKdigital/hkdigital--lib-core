export class LoggerError extends Error
{
  /**
   * @param {Error} originalError
   */
  constructor( originalError ) {
    super('LoggerError');
    this.name = 'LoggerError';
    this.cause = originalError;
  }
}
