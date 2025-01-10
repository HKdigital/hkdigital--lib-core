import { tick } from 'svelte';

/**
 * Waits for a state condition to be met by running the checkFn
 * function after each Svelte tick
 *
 * @param {() => boolean} checkFn -
 *   Should return true when desired state is reached
 *
 * @param {number} [maxWaitMs=1000]
 *
 * @returns {Promise<void>} Promise that resolves when the check
 *   function returns true
 * @throws {Error} if maxAttempts is reached before
 * predicate returns true
 */
export function waitForState(checkFn, maxWaitMs = 1000) {
  let startedAt = Date.now();

  return new Promise((resolve, reject) => {
    async function checkLoop() {
      if (checkFn()) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= maxWaitMs) {
        reject(new Error(`State change timeout`));
        return;
      }

      await tick();
      checkLoop();
    }

    checkLoop();
  });
}
