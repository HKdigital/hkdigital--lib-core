
import { createServerLogger } from '$lib/logging/index.js';
import { throwExpectError } from '$lib/logging/test-errors.js';

const logger = createServerLogger('test-logger');

export const actions = {
  triggerServerError: async () => {
    try {
      throwExpectError();
      return {
        success: true,
        message: 'No error occurred (unexpected)'
      };
    } catch (error) {
      // Send output to server logger
      logger.error('Server expect error test', error);

      return {
        success: false,
        message: 'Server expect error logged',
        error: error.message,
        errorType: error.constructor.name
      };
    }
  }
};
