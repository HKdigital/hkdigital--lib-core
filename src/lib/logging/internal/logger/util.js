import { DetailedError } from '$lib/generic/errors/generic.js';

/**
 * Cast ErrorEvent to DetailedError
 * @param {ErrorEvent} errorEvent - Browser ErrorEvent object
 * @returns {DetailedError}
 */
export function castErrorEventToDetailedError(errorEvent) {
  const message = errorEvent.error?.message || 
                  errorEvent.message || 
                  'Unknown error';
  
  const details = {
    filename: errorEvent.filename,
    lineno: errorEvent.lineno,
    colno: errorEvent.colno,
    type: 'ErrorEvent'
  };
  
  return new DetailedError(message, details, errorEvent.error);
}

/**
 * Cast PromiseRejectionEvent to DetailedError  
 * @param {PromiseRejectionEvent} rejectionEvent - Browser promise rejection
 * @returns {DetailedError}
 */
export function castPromiseRejectionToDetailedError(rejectionEvent) {
  const reason = rejectionEvent.reason;
  let message, cause;
  
  if (reason instanceof Error) {
    message = reason.message;
    cause = reason;
  } else {
    message = String(reason);
    cause = null;
  }
  
  const details = {
    type: 'PromiseRejectionEvent',
    reasonType: typeof reason
  };
  
  return new DetailedError(message, details, cause);
}

