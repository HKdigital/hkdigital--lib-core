export class SecretKeyError extends Error {}

export class TokenExpiredError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Date|{expiredAt?: Date}} [details] - When token expired or details object
   * @param {Error} [cause] - Original error
   */
  constructor(message, details, cause) {
    super(message);
    this.name = 'TokenExpiredError';
    
    // Handle both Date and object formats for details
    if (details instanceof Date) {
      this.expiredAt = details;
    } else {
      this.expiredAt = details?.expiredAt ?? null;
    }
    
    this.cause = cause ?? null;
  }
}

export class JsonWebTokenError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Error|{inner?: Error}} [details] - Inner error or details object
   * @param {Error} [cause] - Original error
   */
  constructor(message, details, cause) {
    super(message);
    this.name = 'JsonWebTokenError';
    
    // Handle both Error and object formats for details
    if (details instanceof Error) {
      this.inner = details;
    } else {
      this.inner = details?.inner ?? null;
    }
    
    this.cause = cause ?? null;
  }
}

export class InvalidSignatureError extends JsonWebTokenError {
  /**
   * @param {string} message - Error message
   * @param {Error|{inner?: Error}} [details] - Inner error or details object
   * @param {Error} [cause] - Original error
   */
  constructor(message, details, cause) {
    super(message, details, cause);
    this.name = 'InvalidSignatureError';
  }
}

export class NotBeforeError extends JsonWebTokenError {
  /**
   * @param {string} message - Error message
   * @param {Date|{date?: Date}} [details] - Date when token becomes valid or details object
   * @param {Error} [cause] - Original error
   */
  constructor(message, details, cause) {
    super(message, null, cause);
    this.name = 'NotBeforeError';
    
    // Handle both Date and object formats for details
    if (details instanceof Date) {
      this.date = details;
    } else {
      this.date = details?.date ?? null;
    }
  }
}
