/**
 * @fileoverview Combined environment variables export (server-side only)
 *
 * Re-exports combined environment utilities for convenient importing.
 * IMPORTANT: This module can only be imported on the server side since it
 * imports private environment variables.
 *
 * @example
 * import { getAllEnv, getAllEnvByPrefix } from '$lib/util/sveltekit/env-all.js';
 *
 * const allVars = getAllEnv();
 * const dbConfig = getAllEnvByPrefix('DATABASE');
 */

export {
  getAllEnv,
  getAllEnvByPrefix,
  getRawAllEnv
} from './env/all.js';