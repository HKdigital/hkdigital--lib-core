/**
 * Shared error formatting logic for logging adapters
 * 
 * This module contains reusable functions for analyzing and formatting
 * errors with enhanced stack trace detection and error type identification.
 */

/**
 * Find the most relevant frame index for highlighting in stack traces
 * 
 * @param {Error} error - The error object
 * @param {string[]} cleanedStack - Array of cleaned stack trace frames
 * @returns {number} Index of the most relevant frame to highlight
 */
export function findRelevantFrameIndex(error, cleanedStack) {
  // Check if this is a LoggerError - look for Logger.error call
  if (error.name === 'LoggerError') {
    const loggerErrorIndex = cleanedStack.findIndex(frame => 
      frame.includes('Logger.error') && frame.includes('logger/Logger.js')
    );
    if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStack.length) {
      return loggerErrorIndex + 1;
    }
  }

  if (error.name === 'ValiError') {
    // Look for expect_ function first, user code is right after (handle Node.js format)
    const expectIndex = cleanedStack.findIndex(frame => 
      frame.includes('expect_') || frame.includes('Module.expect_')
    );
    if (expectIndex >= 0 && expectIndex + 1 < cleanedStack.length) {
      return expectIndex + 1;
    }
    
    // If no expect_ function, look for valibotParser, user code is right after
    const valibotIndex = cleanedStack.findIndex(frame => frame.includes('valibotParser'));
    if (valibotIndex >= 0 && valibotIndex + 1 < cleanedStack.length) {
      return valibotIndex + 1;
    }
  }

  if (error.name === 'DetailedError') {
    // Check if this DetailedError was created by Logger.error - look for Logger.error call first
    // Handle both Firefox format (error@file) and Node.js format (at Logger.error (file))
    const loggerErrorIndex = cleanedStack.findIndex(frame => 
      (frame.includes('Logger.error') && frame.includes('logger/Logger.js')) ||
      (frame.includes('error@') && frame.includes('logger/Logger.js'))
    );
    if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStack.length) {
      return loggerErrorIndex + 1;
    }
    
    // Look for rethrow, user code is right after (handle both Firefox and Node.js format)
    const rethrowIndex = cleanedStack.findIndex(frame => 
      frame.includes('rethrow@') || frame.includes('at rethrow (')
    );
    if (rethrowIndex >= 0 && rethrowIndex + 1 < cleanedStack.length) {
      return rethrowIndex + 1;
    }
  }

  if (error.name === 'PromiseError') {
    // Look for HkPromise methods, user code is right after
    const hkPromiseIndex = cleanedStack.findIndex(frame => 
      frame.includes('reject@') || 
      frame.includes('tryReject@') || 
      frame.includes('setTimeout@') || 
      frame.includes('cancel@') || 
      frame.includes('tryCancel@')
    );
    if (hkPromiseIndex >= 0 && hkPromiseIndex + 1 < cleanedStack.length) {
      return hkPromiseIndex + 1;
    }
  }

  if (error.name === 'HttpError') {
    // Find the last frame containing http-request.js, then highlight the next one
    let lastHttpIndex = -1;
    for (let i = 0; i < cleanedStack.length; i++) {
      if (cleanedStack[i].includes('network/http/http-request.js')) {
        lastHttpIndex = i;
      }
    }
    if (lastHttpIndex >= 0 && lastHttpIndex + 1 < cleanedStack.length) {
      return lastHttpIndex + 1;
    }
  }

  // Default to first frame
  return 0;
}

/**
 * Detect error metadata for structured logging and display
 * 
 * @param {Error} error - The error object
 * @param {string[]} cleanedStack - Array of cleaned stack trace frames
 * @returns {import('./typedef.js').ErrorSummaryMeta} Error metadata
 */
export function detectErrorMeta(error, cleanedStack) {
  const userFunctionName = extractUserFunctionName(error, cleanedStack);
  const relevantFrameIndex = findRelevantFrameIndex(error, cleanedStack);

  // Check if it's a LoggerError
  if (error.name === 'LoggerError') {
    return {
      category: 'logger',
      method: 'logger.error',
      origin: userFunctionName,
      relevantFrameIndex
    };
  }

  // Check if it's a rethrow error
  if (error.name === 'DetailedError') {
    // Check if this DetailedError was created by Logger.error
    const cleanedStackArray = cleanedStack || [];
    const loggerErrorIndex = cleanedStackArray.findIndex(frame => 
      (frame.includes('Logger.error') && frame.includes('logger/Logger.js')) ||
      (frame.includes('error@') && frame.includes('logger/Logger.js'))
    );
    
    if (loggerErrorIndex >= 0) {
      return {
        category: 'logger',
        method: 'logger.error',
        origin: userFunctionName,
        relevantFrameIndex
      };
    }
    
    // Otherwise it's a regular rethrow error
    return {
      category: 'rethrow',
      method: 'rethrow',
      origin: userFunctionName,
      relevantFrameIndex
    };
  }

  // Check if it's a PromiseError (HkPromise)
  if (error.name === 'PromiseError') {
    const hkPromiseMethod = getHkPromiseMethod(cleanedStack);
    return {
      category: 'promise',
      method: hkPromiseMethod ? `hkpromise.${hkPromiseMethod}` : 'hkpromise',
      origin: userFunctionName,
      relevantFrameIndex
    };
  }

  // Check if it's an HttpError
  if (error.name === 'HttpError') {
    const httpMethod = getHttpMethod(cleanedStack);
    return {
      category: 'http',
      method: httpMethod || 'http',
      origin: userFunctionName,
      relevantFrameIndex
    };
  }

  // Check if it's a valibot validation error
  if (error.name === 'ValiError' && cleanedStack.length > 0) {
    // Look for our valibotParser wrapper function in the stack
    const valibotFrame = cleanedStack.find(frame => 
      frame.includes('valibotParser')
    );
    
    // Also check if it's called via an expect_ function (handle Node.js format)
    const expectFrame = cleanedStack.find(frame => 
      frame.includes('expect_') || frame.includes('Module.expect_')
    );
    
    if (valibotFrame || expectFrame) {
      return {
        category: 'validation',
        method: expectFrame ? 'expect' : 'validation',
        origin: userFunctionName,
        relevantFrameIndex
      };
    }
  }

  // Default case
  return {
    category: 'error',
    method: 'error',
    origin: userFunctionName,
    relevantFrameIndex
  };
}

/**
 * Format error metadata for console display
 * 
 * @param {{category: string, method: string, origin: string|null}} errorMeta - Error metadata
 * @returns {string} Formatted display string (e.g., "httpGet in myFunction")
 */
export function formatErrorDisplay(errorMeta) {
  if (errorMeta.origin) {
    return `${errorMeta.method} in ${errorMeta.origin}`;
  }
  return errorMeta.method;
}

/**
 * Get the specific HkPromise method that caused the error
 * 
 * @param {string[]} cleanedStack - Array of cleaned stack trace frames
 * @returns {string|null} HkPromise method name or null
 */
export function getHkPromiseMethod(cleanedStack) {
  const hkPromiseFrame = cleanedStack.find(frame => 
    frame.includes('reject@') || 
    frame.includes('tryReject@') || 
    frame.includes('setTimeout@') || 
    frame.includes('cancel@') || 
    frame.includes('tryCancel@')
  );
  
  if (!hkPromiseFrame) return null;
  
  if (hkPromiseFrame.includes('reject@')) return 'reject';
  if (hkPromiseFrame.includes('tryReject@')) return 'tryReject';
  if (hkPromiseFrame.includes('setTimeout@')) return 'setTimeout';
  if (hkPromiseFrame.includes('cancel@')) return 'cancel';
  if (hkPromiseFrame.includes('tryCancel@')) return 'tryCancel';
  
  return null;
}

/**
 * Get the specific HTTP method that caused the error
 * 
 * @param {string[]} cleanedStack - Array of cleaned stack trace frames
 * @returns {string|null} HTTP method name or null
 */
export function getHttpMethod(cleanedStack) {
  const httpFrame = cleanedStack.find(frame => 
    frame.includes('network/http/http-request.js')
  );
  
  if (!httpFrame) return null;
  
  if (httpFrame.includes('httpGet@')) return 'httpGet';
  if (httpFrame.includes('httpPost@')) return 'httpPost';
  if (httpFrame.includes('httpPut@')) return 'httpPut';
  if (httpFrame.includes('httpDelete@')) return 'httpDelete';
  if (httpFrame.includes('httpPatch@')) return 'httpPatch';
  if (httpFrame.includes('httpOptions@')) return 'httpOptions';
  if (httpFrame.includes('httpRequest@')) return 'httpRequest';
  
  return null;
}

/**
 * Extract user function name from stack trace
 * 
 * @param {Error} error - The error object
 * @param {string[]} cleanedStack - Array of cleaned stack trace frames
 * @returns {string|null} User function name or null
 */
export function extractUserFunctionName(error, cleanedStack) {
  // Check if this is a LoggerError - look for the frame after Logger.error
  if (error.name === 'LoggerError' && cleanedStack.length > 1) {
    const loggerErrorIndex = cleanedStack.findIndex(frame => 
      frame.includes('Logger.error') && frame.includes('logger/Logger.js')
    );
    if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[loggerErrorIndex + 1]);
    }
  }

  if (error.name === 'DetailedError' && cleanedStack.length > 1) {
    // Check if this DetailedError was created by Logger.error - look for the frame after Logger.error
    const loggerErrorIndex = cleanedStack.findIndex(frame => 
      (frame.includes('Logger.error') && frame.includes('logger/Logger.js')) ||
      (frame.includes('error@') && frame.includes('logger/Logger.js'))
    );
    if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[loggerErrorIndex + 1]);
    }
    
    // For rethrow errors, look for the frame after rethrow (handle both formats)
    const rethrowIndex = cleanedStack.findIndex(frame => 
      frame.includes('rethrow@') || frame.includes('at rethrow (')
    );
    if (rethrowIndex >= 0 && rethrowIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[rethrowIndex + 1]);
    }
  }

  if (error.name === 'PromiseError' && cleanedStack.length > 1) {
    // For PromiseError, look for the frame after HkPromise methods
    const hkPromiseIndex = cleanedStack.findIndex(frame => 
      frame.includes('reject@') || 
      frame.includes('tryReject@') || 
      frame.includes('setTimeout@') || 
      frame.includes('cancel@') || 
      frame.includes('tryCancel@')
    );
    if (hkPromiseIndex >= 0 && hkPromiseIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[hkPromiseIndex + 1]);
    }
  }

  if (error.name === 'HttpError' && cleanedStack.length > 1) {
    // For HttpError, find the last frame containing http-request.js, then take the next one
    let lastHttpIndex = -1;
    for (let i = 0; i < cleanedStack.length; i++) {
      if (cleanedStack[i].includes('network/http/http-request.js')) {
        lastHttpIndex = i;
      }
    }
    if (lastHttpIndex >= 0 && lastHttpIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[lastHttpIndex + 1]);
    }
  }

  if (error.name === 'ValiError' && cleanedStack.length > 1) {
    // For validation errors, look for the frame after expect_ function first (handle Node.js format)
    const expectIndex = cleanedStack.findIndex(frame => 
      frame.includes('expect_') || frame.includes('Module.expect_')
    );
    if (expectIndex >= 0 && expectIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[expectIndex + 1]);
    }
    
    // If no expect_ function, look for valibotParser wrapper
    const valibotIndex = cleanedStack.findIndex(frame => frame.includes('valibotParser'));
    if (valibotIndex >= 0 && valibotIndex + 1 < cleanedStack.length) {
      return parseFunctionName(cleanedStack[valibotIndex + 1]);
    }
  }

  // Find the first meaningful function name (skip anonymous functions and framework code)
  for (let i = 0; i < cleanedStack.length; i++) {
    const functionName = parseFunctionName(cleanedStack[i]);
    if (functionName && isMeaningfulFunctionName(functionName)) {
      return functionName;
    }
  }

  return null;
}

/**
 * Check if function name is meaningful (not anonymous or framework code)
 * 
 * @param {string} functionName - Function name to check
 * @returns {boolean} True if the function name is meaningful
 */
export function isMeaningfulFunctionName(functionName) {
  // Skip empty names, anonymous functions, and framework/internal functions
  if (!functionName || 
      functionName === '' || 
      functionName.includes('<') || 
      functionName.includes('/') ||
      functionName.startsWith('async ') ||
      functionName === 'async' ||
      functionName === 'Promise' ||
      functionName === 'new Promise' ||
      functionName.includes('internal') ||
      functionName.includes('node_modules')) {
    return false;
  }
  
  return true;
}

/**
 * Parse function name from stack frame
 * 
 * @param {string} frame - Stack trace frame
 * @returns {string|null} Function name or null
 */
export function parseFunctionName(frame) {
  // Handle both Firefox format: "functionName@file:line:col"
  // and Node.js format: "at functionName (file:line:col)" or "at Module.functionName (file:line:col)"
  
  // Firefox format
  const firefoxMatch = frame.match(/^([^@]+)@/);
  if (firefoxMatch) {
    return firefoxMatch[1];
  }
  
  // Node.js format
  const nodeMatch = frame.match(/^\s*at\s+(?:Module\.)?([^\s(]+)/);
  if (nodeMatch) {
    return nodeMatch[1];
  }
  
  return null;
}