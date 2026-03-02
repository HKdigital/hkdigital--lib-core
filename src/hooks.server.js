import { createServerLogger, DEBUG } from '$lib/logging/server.js';
import { handleLang } from '$lib/meta.js';

/** @type {import('$lib/logging/common.js').Logger} */
let logger;

// Initialize server logging and services
export async function init() {
  logger = createServerLogger('app-server-logger', DEBUG);

  try {
    logger.info('Initializing server');

    // Initialize your services here
    // const serviceManager = new ServiceManager();
    // await serviceManager.startAll();

    logger.info('Server initialization complete');
  } catch (error) {
    logger.error('Server initialization failed:', /** @type {Error} */ (error));
    throw error;
  }
}

// HandleServerError
// @ts-ignore
export const handleError = ({ error, /* event, */ status, message }) => {
  if (status !== 404) {
    logger.error(error);
  }

  // Do not return sensitive data here as it will be sent to the client
  return { message };
};

/**
 * Handle all requests
 *
 * Language detection is handled by handleLang from (meta)/index.js
 *
 * If you have existing hooks (auth, sessions, etc.), see integration
 * patterns in src/routes/(meta)/README.md - "Integrating Language Detection
 * into Hooks"
 *
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
  // Handle language detection and injection
  return handleLang(event, resolve);

  // For complex integrations, use this pattern instead:
  /*
  import { getLangFromPath, injectLang } from '$lib/meta.js';

  const { langCode, lang, locale } = getLangFromPath(event.url.pathname);
  event.locals.langCode = langCode;
  event.locals.lang = lang;
  event.locals.locale = locale;

  // ... your existing hooks logic here ...

  return resolve(event, {
    transformPageChunk: ({ html }) => injectLang(html, lang)
  });
  */
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
