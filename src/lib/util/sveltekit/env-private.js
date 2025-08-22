/**
 * @fileoverview Private environment variables export (server-side only)
 *
 * Re-exports private environment utilities for convenient importing.
 * IMPORTANT: This module can only be imported on the server side.
 *
 * @example
 * import { getPrivateEnv, getPrivateEnvByPrefix } from '$lib/util/sveltekit/env-private.js';
 *
 * const privateVars = getPrivateEnv();
 * const dbConfig = getPrivateEnvByPrefix('DATABASE');
 */

export {
  getPrivateEnv,
  getPrivateEnvByPrefix,
  getRawPrivateEnv
} from './env/private.js';