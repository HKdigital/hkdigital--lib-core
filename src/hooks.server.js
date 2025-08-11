import { createServerLogger } from '$lib/logging/index.js';

let logger;

// Initialize server logging and services
export async function init() {
  logger = createServerLogger('app-server-logger');

  try {
    logger.info('Initializing server');

    // Initialize your services here
    // const serviceManager = new ServiceManager();
    // await serviceManager.startAll();

    logger.info('Server initialization complete');
  } catch (error) {
    logger.error('Server initialization failed:', error);
    throw error;
  }
}

// HandleServerError
export const handleError = ({ error, /* event, */ status, message }) => {
  if (status !== 404) {
    logger.error(error);
  }

  // Do not return sensitive data here as it will be sent to the client
  return { message };
};

/**
 * Handle all requests
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  return response;
}

// Graceful shutdown
export async function destroy() {
  if (logger) {
    logger.info('Shutting down server');

    // Clean up services here
    // if (serviceManager) {
    //   await serviceManager.stopAll();
    // }
  }
}
