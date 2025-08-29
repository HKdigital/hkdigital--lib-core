/**
 * Test transport for validating lazy initialization behavior
 */

/**
 * Create a mock transport for testing lazy initialization scenarios
 *
 * @param {Object} [opts] - Test configuration options
 * @param {number} [opts.delay=100] - Initialization delay in milliseconds
 * @param {boolean} [opts.shouldFail=false] - Whether initialization should fail
 * @param {string} [opts.failureMessage] - Custom failure message
 * @param {boolean} [opts.shouldFailOnWrite=false] - Fail on write operations
 * @returns {Promise<Object>} Transport-compatible object
 */
export default async function createTestTransport(opts = {}) {
  const { 
    delay = 100, 
    shouldFail = false,
    failureMessage = 'Test transport setup failed',
    shouldFailOnWrite = false
  } = opts;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(failureMessage));
        return;
      }

      const messages = [];
      
      resolve({
        /**
         * Write log message to test transport
         *
         * @param {string} chunk - JSON log message
         */
        write(chunk) {
          if (shouldFailOnWrite) {
            throw new Error('Test transport write failure');
          }
          
          messages.push(chunk);
        },

        /**
         * Get all captured messages
         *
         * @returns {string[]} Array of log message chunks
         */
        getMessages() {
          return [...messages];
        },

        /**
         * Clear captured messages
         */
        clear() {
          messages.length = 0;
        },

        /**
         * Get parsed log objects from captured messages
         *
         * @returns {Object[]} Array of parsed log objects
         */
        getParsedMessages() {
          return messages.map(chunk => {
            try {
              return JSON.parse(chunk);
            } catch {
              return { raw: chunk };
            }
          });
        }
      });
    }, delay);
  });
}