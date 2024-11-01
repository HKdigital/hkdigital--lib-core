/**
 * @example
 *
 * import { logger } from './logger.js';
 *
 * logger.info('Hello there!');
 * logger.info( { a: 1, b: 2 }, 'Test vars');
 *
 * export function load({ route }) {
 *   logger.context({route}).info('Log');
 * }
 *
 * @note
 * Set a 'handleError' hook to log errors captured by svelte
 *
 * // hooks.server.js
 * export const handleError = ({ status, error, message }) => {
 *	  if (status !== 404) {
 *		  logger.error(error);
 *	  }
 *
 *	  // do not return sensitive data here as it will be sent to the client
 * 	  return { message };
 *  };
 *
 * @see https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror
 * @see https://stolthq.com/blog/structured-logging-sveltekit
 */

import pino from 'pino';
import { dev } from '$app/environment';

// import { browser, building, dev, version } from '$app/environment';

// > Setup

/** @type {pino.LoggerOptions} */
let options = {};

if (dev) {
	options = {
		level: 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true
			}
		}
	};
}

// > Exports

// ?? function routeLogger( ... )

/**
 * @typedef {object} LoggerContext
 * @property {{ id: string }} [route]
 * @property {string} [componentName]
 */

/**
 * @typedef {pino.Logger & LoggerExtension} ExtendedLogger
 */

/**
 * @typedef {Object} LoggerExtension
 * @property {( context: LoggerContext )=> ExtendedLogger} context
 */

/** @type {pino.Logger & LoggerExtension} */
// @ts-ignore
const logger = pino(options);

Object.assign(logger, {
	/**
	 * @param {LoggerContext} _
	 *
	 * @returns {pino.Logger}
	 */
	context({ route, componentName }) {
		if (route) {
			// @ts-ignore
			return this.child({ route: route.id });
		} else if (componentName) {
			// @ts-ignore
			return this.child({ componentName });
		} else {
			throw new Error(`Missing input parameter`);
		}
	}
});

export { logger };
