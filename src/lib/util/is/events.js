/**
 * Check if object is an ErrorEvent
 *
 * @param {any} obj
 *
 * @returns {boolean}
 */
export function ErrorEvent(obj) {
  return Boolean(obj && 
                 typeof obj === 'object' && 
                 obj.constructor?.name === 'ErrorEvent');
}

/**
 * Check if object is a PromiseRejectionEvent
 *
 * @param {any} obj
 *
 * @returns {boolean}
 */
export function PromiseRejectionEvent(obj) {
  return Boolean(obj && 
                 typeof obj === 'object' && 
                 obj.constructor?.name === 'PromiseRejectionEvent');
}