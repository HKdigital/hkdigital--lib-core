/**
 * Custom transport wrapper for pino-pretty that avoids worker threads
 * and provides lazy loading to prevent Vite hot reload interference
 */

/**
 * Create a pino-pretty transport that loads synchronously but initializes
 * pino-pretty lazily to avoid worker thread conflicts with Vite
 *
 * @param {Object} [opts] - pino-pretty options
 * @param {boolean} [opts.colorize=true] - Enable colored output
 * @param {string} [opts.ignore] - Fields to ignore in output
 * @returns {Promise<Object>} Transport-compatible object
 */
export default async function createPrettyTransport(opts = {}) {
  let prettyStream = null;
  let messageQueue = [];
  let isInitializing = false;

  /**
   * Initialize pino-pretty stream
   */
  async function initializePrettyStream() {
    if (isInitializing || prettyStream) {
      return;
    }

    isInitializing = true;

    try {
      const { default: pinoPretty } = await import('pino-pretty');
      prettyStream = pinoPretty({
        colorize: true,
        ignore: 'hostname,pid',
        ...opts
      });

      // Flush queued messages
      while (messageQueue.length > 0) {
        const chunk = messageQueue.shift();
        prettyStream.write(chunk);
      }

    } catch (error) {
      console.error('Failed to initialize pino-pretty:', error.message);
      
      // Fallback to console output
      prettyStream = {
        write(chunk) {
          try {
            const log = JSON.parse(chunk);
            const level = log.level >= 50 ? 'ERROR' : 
                         log.level >= 40 ? 'WARN' : 
                         log.level >= 30 ? 'INFO' : 'DEBUG';
            console.log(`[${level}] ${log.msg}`, log);
          } catch {
            console.log(chunk);
          }
        }
      };

      // Flush queue to console fallback
      while (messageQueue.length > 0) {
        const chunk = messageQueue.shift();
        prettyStream.write(chunk);
      }
    }

    isInitializing = false;
  }

  return {
    /**
     * Write log message to transport
     *
     * @param {string} chunk - JSON log message
     */
    write(chunk) {
      if (!prettyStream) {
        messageQueue.push(chunk);
        
        // Limit queue size
        if (messageQueue.length > 1000) {
          messageQueue.shift();
        }

        // Start initialization if not already started
        if (!isInitializing) {
          initializePrettyStream();
        }
        return;
      }

      try {
        prettyStream.write(chunk);
      } catch (error) {
        console.error('Pretty stream write failed:', error.message);
        messageQueue.push(chunk);
        prettyStream = null;
        initializePrettyStream();
      }
    }
  };
}
