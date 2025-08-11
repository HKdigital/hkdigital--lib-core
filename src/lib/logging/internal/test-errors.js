import { expect, rethrow } from '$lib/util/index.js';
import { HkPromise } from '$lib/generic/promises.js';
import { httpGet } from '$lib/network/http/index.js';
import { v } from '$lib/valibot/index.js';

/**
 * Test functions for generating various types of errors for logging demonstration
 */

/**
 * Simple error: division by zero (which creates NaN in JS, so we'll throw manually)
 */
export function throwSimpleError() {
  const a = 10;
  const b = 0;
  
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  
  return a / b; // This won't be reached
}

/**
 * Simple error occurring in a sub function
 */
export function throwErrorInSubFunction() {
  function deepFunction() {
    function evenDeeperFunction() {
      throw new Error('Error occurred in deeply nested function');
    }
    
    evenDeeperFunction();
  }
  
  function callDeepFunction() {
    deepFunction();
  }
  
  callDeepFunction();
}

/**
 * Promise rejection in async function
 */
export async function throwPromiseRejection() {
  // Create a promise that rejects after a short delay
  const rejectedPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Promise was rejected after timeout'));
    }, 100);
  });
  
  // Await the promise (will throw)
  return await rejectedPromise;
}

/**
 * HkPromise timeout
 */
export async function throwHkPromiseTimeout() {
  // Create an HkPromise that times out
  const timeoutPromise = new HkPromise((resolve) => {
    // Never resolve this promise to cause timeout
    setTimeout(() => {
      // This resolve will never be reached because timeout occurs first
      resolve('This should not complete');
    }, 2000);
  });
  
  // Set timeout of 500ms (will timeout before the 2000ms resolve)
  timeoutPromise.setTimeout(500, 'HkPromise timeout after 500ms');
  
  return await timeoutPromise;
}

/**
 * HTTP request that fails
 */
export async function throwHttpException() {
  // Try to fetch with an invalid URL format
  const response = await httpGet({
    url: 'not-a-valid-url-format'
  });
  return response;
}

/**
 * Expect validation error
 */
export function throwExpectError() {
  try {
    // This will always fail and trigger an expect error
    expect.string(123);
  } catch (e) {
    rethrow('throwExpectError failed', e);
  }
}

/**
 * Rethrow chain error
 */
export function throwRethrowChainError() {
  function level1Function() {
    try {
      level2Function();
    } catch (e) {
      rethrow('Error in level1Function', e);
    }
  }
  
  function level2Function() {
    throw new Error('Original error at deepest level');
    // try {
    //   level3Function();
    // } catch (e) {
    //   rethrow('Error in level2Function', e);
    // }
  }
  
  // function level3Function() {
  //   throw new Error('Original error at deepest level');
  // }
  
  level1Function();
}

/**
 * Raw valibot validation error (without expect wrapper)
 */
export function throwRawValibotError() {
  // This calls valibot.parse directly, not through expect_*
  const schema = v.string();
  const invalidValue = 456;
  
  // This will throw a ValiError directly from our valibotParser wrapper
  return v.parse(schema, invalidValue);
}
