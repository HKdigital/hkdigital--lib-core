
import { createServerLogger } from '$lib/logging/index.js';

const logger = createServerLogger('page-server-logger');

import { throwExpectError } from '$lib/logging/test-errors.js';

export const actions = {
  triggerServerError: async () => {
    try {
      logger.info('hello');

      throwExpectError();
      return {
        success: true,
        message: 'No error occurred (unexpected)'
      };
    } catch (error) {
      // Send output to server logger via locals
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
