
import { createServerLogger } from '$lib/logging/index.js';

const logger = createServerLogger('page-server-logger');

import {
  throwSimpleError,
  throwErrorInSubFunction,
  throwPromiseRejection,
  throwHkPromiseTimeout,
  throwHttpException,
  throwExpectError,
  throwRethrowChainError,
  throwRawValibotError
} from '$lib/logging/internal/test-errors.js';

/**
 * Generic error handler for server actions
 */
async function handleServerTest(testName, testFunction) {
  try {
    await testFunction();
    return {
      success: true,
      message: 'No error occurred (unexpected)'
    };
  } catch (error) {
    // Send output to server logger
    // logger.info(`Test info`);
    // logger.error(`Test [${testName}]`, error);
    logger.error(error);
    // logger.error('ups');

    return {
      success: false,
      message: `Server ${testName} error logged`,
      error: error.message,
      errorType: error.constructor.name
    };
  }
}

export const actions = {
  triggerSimpleError: () => handleServerTest('simple error', throwSimpleError),
  triggerNestedError: () => handleServerTest('nested error', throwErrorInSubFunction),
  triggerPromiseRejection: () => handleServerTest('promise rejection', throwPromiseRejection),
  triggerHkPromiseTimeout: () => handleServerTest('HkPromise timeout', throwHkPromiseTimeout),
  triggerHttpException: () => handleServerTest('HTTP exception', throwHttpException),
  triggerExpectError: () => handleServerTest('expect validation', throwExpectError),
  triggerRethrowChain: () => handleServerTest('rethrow chain', throwRethrowChainError),
  triggerRawValibotError: () => handleServerTest('raw valibot', throwRawValibotError)
};
