/**
 * @fileoverview Public environment variables export
 *
 * Re-exports public environment utilities for convenient importing.
 * Safe to use on both client and server side.
 *
 * @example
 * import { getPublicEnv, getPublicEnvByPrefix } from '$lib/util/sveltekit/env-public.js';
 *
 * const publicVars = getPublicEnv();
 * const apiConfig = getPublicEnvByPrefix('PUBLIC_API');
 */

export {
  getPublicEnv,
  getPublicEnvByPrefix,
  getRawPublicEnv
} from './env/public.js';