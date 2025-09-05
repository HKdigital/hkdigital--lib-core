/**
 * @fileoverview Simple event emitter implementation to support event-based architecture
 * in service management and other parts of the application.
 *
 * This implementation provides standard event publishing and subscription methods
 * with support for namespaced events, wildcard listeners, and callback removal.
 *
 * @example
 * // Basic usage
 * import { EventEmitter } from './EventEmitter.js';
 *
 * // Create an emitter
 * const events = new EventEmitter();
 *
 * // Subscribe to events
 * const unsubscribe = events.on('data-loaded', (data) => {
 *   console.log('Data loaded:', data);
 * });
 *
 * // Subscribe to all events with a specific prefix
 * events.on('database:*', ({ event, data }) => {
 *   console.log(`Database event ${event}:`, data);
 * });
 *
 * // Emit events
 * events.emit('data-loaded', { items: [1, 2, 3] });
 * events.emit('database:connected', { connectionId: 'abc123' });
 *
 * // Clean up when done
 * unsubscribe();
 *
 * // Or remove all listeners
 * events.removeAllListeners();
 */

/**
 * EventEmitter class for event-based programming
 */
export default class EventEmitter {
  /**
   * Create a new EventEmitter instance
   */
  constructor() {
    /**
     * Map to store event handlers
     * @type {Map<string, Set<Function>>}
     * @private
     */
    this.eventHandlers = new Map();

    /**
     * Map to store wildcard event handlers (events ending with *)
     * @type {Map<string, Set<Function>>}
     * @private
     */
    this.wildcardHandlers = new Map();
  }

  /**
   * Register an event handler
   *
   * @param {string} eventName - Event name to listen for. Can use wildcard (*)
   *        at the end to listen to all events with a specific prefix.
   * @param {Function} handler - Handler function to call when event is emitted
   * @returns {Function} Function to remove this specific handler
   *
   * @example
   * // Listen for a specific event
   * emitter.on('userLoggedIn', (user) => {
   *   console.log(`User logged in: ${user.name}`);
   * });
   *
   * // Listen for all events with a prefix
   * emitter.on('api:*', ({ event, data }) => {
   *   console.log(`API event ${event}:`, data);
   * });
   */
  on(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }

    // Handle wildcard listeners
    if (eventName.endsWith('*')) {
      const prefix = eventName.slice(0, -1);

      if (!this.wildcardHandlers.has(prefix)) {
        this.wildcardHandlers.set(prefix, new Set());
      }

      this.wildcardHandlers.get(prefix).add(handler);

      return () => this.off(eventName, handler);
    }

    // Handle normal listeners
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }

    this.eventHandlers.get(eventName).add(handler);

    return () => this.off(eventName, handler);
  }

  /**
   * Register a one-time event handler that will be removed after first execution
   *
   * @param {string} eventName - Event name to listen for
   * @param {Function} handler - Handler function to call when event is emitted
   * @returns {Function} Function to remove this specific handler
   *
   * @example
   * emitter.once('initialization', () => {
   *   console.log('Initialization happened');
   * });
   */
  once(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a function');
    }

    /** @param {...any} args */
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      handler(...args);
    };

    return this.on(eventName, wrapper);
  }

  /**
   * Remove an event handler
   *
   * @param {string} eventName - Event name the handler was registered for
   * @param {Function} handler - Handler function to remove
   * @returns {boolean} True if the handler was removed, false otherwise
   *
   * @example
   * const handler = (data) => console.log(data);
   * emitter.on('data', handler);
   * emitter.off('data', handler);
   */
  off(eventName, handler) {
    // Handle wildcard listeners
    if (eventName.endsWith('*')) {
      const prefix = eventName.slice(0, -1);
      const handlers = this.wildcardHandlers.get(prefix);

      if (handlers) {
        return handlers.delete(handler);
      }

      return false;
    }

    // Handle normal listeners
    const handlers = this.eventHandlers.get(eventName);

    if (handlers) {
      return handlers.delete(handler);
    }

    return false;
  }

  /**
   * Remove all event handlers for a specific event
   *
   * @param {string} [eventName] - Event name to remove handlers for.
   *        If not provided, removes all handlers for all events.
   *
   * @example
   * // Remove all 'data' event handlers
   * emitter.removeAllListeners('data');
   *
   * // Remove all event handlers
   * emitter.removeAllListeners();
   */
  removeAllListeners(eventName) {
    if (eventName) {
      // Handle wildcard listeners
      if (eventName.endsWith('*')) {
        const prefix = eventName.slice(0, -1);
        this.wildcardHandlers.delete(prefix);
      } else {
        this.eventHandlers.delete(eventName);
      }
    } else {
      // Clear all handlers
      this.eventHandlers.clear();
      this.wildcardHandlers.clear();
    }
  }

  /**
   * Emit an event
   *
   * @param {string} eventName - Name of the event to emit
   * @param {*} data - Data to pass to event handlers
   * @returns {boolean} True if there were handlers for this event, false otherwise
   *
   * @example
   * emitter.emit('dataLoaded', { users: [...] });
   */
  emit(eventName, data) {
    let handled = false;

    // Call specific event handlers
    const handlers = this.eventHandlers.get(eventName);
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => handler(data));
      handled = true;
    }

    // Call matching wildcard handlers
    this.wildcardHandlers.forEach((handlers, prefix) => {
      if (eventName.startsWith(prefix)) {
        handlers.forEach((handler) => handler({ event: eventName, data }));
        handled = true;
      }
    });

    return handled;
  }

  /**
   * Get the number of listeners for a specific event
   *
   * @param {string} eventName - Event name to count listeners for
   * @returns {number} Number of listeners for this event
   *
   * @example
   * const count = emitter.listenerCount('data');
   * console.log(`There are ${count} data event listeners`);
   */
  listenerCount(eventName) {
    let count = 0;

    // Count specific event handlers
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      count += handlers.size;
    }

    // Count matching wildcard handlers
    this.wildcardHandlers.forEach((handlers, prefix) => {
      if (eventName.startsWith(prefix)) {
        count += handlers.size;
      }
    });

    return count;
  }

  /**
   * Get all registered event names
   *
   * @returns {string[]} Array of event names that have listeners
   *
   * @example
   * console.log('Events with listeners:', emitter.eventNames());
   */
  eventNames() {
    const events = [...this.eventHandlers.keys()];

    // Add wildcard events
    this.wildcardHandlers.forEach((_, prefix) => {
      events.push(`${prefix}*`);
    });

    return events;
  }
}
