
import { createServerLogger } from '$lib/logging/index.js';

import { rethrow, expect } from '$lib/util/index.js';

const logger = createServerLogger('test-logger');

/**
 * Server-side function that triggers an expect validation error
 */
function triggerServerExpectError() {
  try {
    // This will always fail and trigger an expect error
    expect.string(123);
  } catch( e )
  {
    rethrow('triggerServerExpectError failed', e );
  }
}

export const actions = {
  triggerServerError: async () => {
    try {
      triggerServerExpectError();
      return {
        success: true,
        message: 'No error occurred (unexpected)'
      };
    } catch (error) {
      // Send output to server logger
      logger.error("The triggered error was ", error);

      return {
        success: false,
        message: 'Server expect error logged',
        error: error.message,
        errorType: error.constructor.name
      };
    }
  }
};
