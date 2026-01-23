/**
 * Reactive key-value data store with fine-grained reactivity
 *
 * Built on SvelteMap for fine-grained reactivity where effects only re-run
 * when the specific keys they access change.
 *
 * Features:
 * - Fine-grained reactivity using SvelteMap
 * - Strict mode: throws on access to uninitialized keys
 * - Production guard: dev-only data throws on read in production
 * - Initialization from plain object
 *
 * @example
 * ```javascript
 * // Regular data store
 * const store = new ReactiveDataStore({
 *   initialData: { score: 0, level: 1 }
 * });
 *
 * store.set('score', 100);
 * const score = store.get('score');  // Reactive access
 *
 * // Dev-only data store
 * const devStore = new ReactiveDataStore({
 *   initialData: { autoNav: false },
 *   productionGuard: true,
 *   errorPrefix: 'Dev data key'
 * });
 *
 * devStore.set('autoNav', true);  // No-op in production
 * devStore.get('autoNav');        // Throws in production
 * ```
 */

import { SvelteMap } from 'svelte/reactivity';
import { dev } from '$app/environment';

export default class ReactiveDataStore {
  /**
   * Internal reactive map
   * @type {SvelteMap<string, any>}
   */
  #data;

  /**
   * Throw on access to uninitialized keys
   * @type {boolean}
   */
  #strictMode;

  /**
   * Guard against production access (for dev-only data)
   * @type {boolean}
   */
  #productionGuard;

  /**
   * Prefix for error messages
   * @type {string}
   */
  #errorPrefix;

  /**
   * Constructor
   *
   * @param {Object} [options]
   * @param {Record<string, any>} [options.initialData={}]
   *   Initial key-value pairs
   * @param {boolean} [options.strictMode=true]
   *   Throw error when accessing uninitialized keys
   * @param {boolean} [options.productionGuard=false]
   *   Dev-only mode: no-op on SET, throw on GET in production
   * @param {string} [options.errorPrefix='Data key']
   *   Prefix for error messages
   */
  constructor({
    initialData = {},
    strictMode = true,
    productionGuard = false,
    errorPrefix = 'Data key'
  } = {}) {
    this.#strictMode = strictMode;
    this.#productionGuard = productionGuard;
    this.#errorPrefix = errorPrefix;

    // Initialize map
    this.#data = new SvelteMap();

    // Only populate initial data in dev mode if guard is enabled
    if (!productionGuard || dev) {
      for (const [key, value] of Object.entries(initialData)) {
        this.#data.set(key, value);
      }
    }
  }

  /**
   * Set a data property value
   *
   * Automatically reactive - effects watching this key will re-run.
   * Uses fine-grained reactivity via SvelteMap.
   *
   * With productionGuard: silent no-op in production (safe to call)
   *
   * @param {string} key - Property key
   * @param {any} value - Property value
   *
   * @example
   * ```javascript
   * store.set('score', 100);
   * store.set('playerName', 'Alice');
   * ```
   */
  set(key, value) {
    // Production guard: no-op silently (safe to call conditionally)
    if (this.#productionGuard && !dev) {
      return;
    }

    this.#data.set(key, value);
  }

  /**
   * Get a data property value
   *
   * Automatically reactive - creates a dependency on this specific key.
   * The effect will only re-run when THIS key changes.
   *
   * With strictMode: throws if key is not initialized
   * With productionGuard: throws in production (programming error)
   *
   * @param {string} key - Property key
   *
   * @returns {any} Property value
   *
   * @throws {Error} If key not initialized (strictMode)
   * @throws {Error} If accessed in production (productionGuard)
   *
   * @example
   * ```javascript
   * // Reactive - re-runs only when 'score' changes
   * $effect(() => {
   *   const score = store.get('score');
   *   console.log('Score:', score);
   * });
   * ```
   */
  get(key) {
    // Production guard: THROW on read in production
    if (this.#productionGuard && !dev) {
      throw new Error(
        `${this.#errorPrefix} "${key}" accessed in production. ` +
        `This data is only available in development mode.`
      );
    }

    // Strict mode: validate key exists
    if (this.#strictMode && !this.#data.has(key)) {
      throw new Error(
        `${this.#errorPrefix} "${key}" is not initialized.`
      );
    }

    return this.#data.get(key);
  }

  /**
   * Get all data properties as plain object
   *
   * Note: Returns a snapshot (plain object), not reactive.
   * Use for serialization or inspection, not for reactive tracking.
   *
   * @returns {Record<string, any>} Plain object with all data
   *
   * @example
   * ```javascript
   * const allData = store.getAll();
   * await saveToServer(allData);
   * ```
   */
  getAll() {
    if (this.#productionGuard && !dev) {
      return {};
    }

    return Object.fromEntries(this.#data);
  }

  /**
   * Update multiple data properties at once
   *
   * Each property update triggers fine-grained reactivity.
   * Only effects watching the specific changed keys will re-run.
   *
   * @param {Record<string, any>} updates
   *   Object with key-value pairs to update
   *
   * @example
   * ```javascript
   * store.update({
   *   score: 100,
   *   level: 5,
   *   completed: true
   * });
   * ```
   */
  update(updates) {
    if (this.#productionGuard && !dev) {
      return;
    }

    for (const [key, value] of Object.entries(updates)) {
      this.#data.set(key, value);
    }
  }

  /**
   * Delete a data property
   *
   * @param {string} key - Property key to delete
   *
   * @returns {boolean} True if the key existed and was deleted
   *
   * @example
   * ```javascript
   * store.delete('temporaryFlag');
   * ```
   */
  delete(key) {
    if (this.#productionGuard && !dev) {
      return false;
    }

    return this.#data.delete(key);
  }

  /**
   * Check if data property exists
   *
   * With productionGuard: throws in production (same as get)
   *
   * @param {string} key - Property key to check
   *
   * @returns {boolean} True if the key exists
   *
   * @throws {Error} If accessed in production (productionGuard)
   *
   * @example
   * ```javascript
   * if (store.has('tutorialSeen')) {
   *   // Skip tutorial
   * }
   * ```
   */
  has(key) {
    // Production guard: THROW on read in production
    if (this.#productionGuard && !dev) {
      throw new Error(
        `${this.#errorPrefix} "${key}" existence check in production. ` +
        `This data is only available in development mode.`
      );
    }

    return this.#data.has(key);
  }

  /**
   * Clear all data properties
   *
   * @example
   * ```javascript
   * store.clear();  // Reset all data
   * ```
   */
  clear() {
    if (this.#productionGuard && !dev) {
      return;
    }

    this.#data.clear();
  }

  /**
   * Get number of data properties
   *
   * @returns {number} Number of data entries
   *
   * @example
   * ```javascript
   * console.log(`Store has ${store.size} entries`);
   * ```
   */
  get size() {
    if (this.#productionGuard && !dev) {
      return 0;
    }

    return this.#data.size;
  }
}
