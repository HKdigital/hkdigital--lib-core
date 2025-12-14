import { Logger, INFO } from '$lib/logging/common.js';

/**
 * Base class for page state machines with URL route mapping
 *
 * Simple state tracker that maps states to URL routes.
 * Does NOT enforce FSM transitions - allows free navigation
 * (because users can navigate to any URL via browser).
 *
 * Features:
 * - State-to-route mapping and sync
 * - Start path management
 * - Data properties for business/domain state
 * - Visited states tracking
 * - onEnter hooks with abort/complete handlers for animations
 *
 * Basic usage:
 * ```javascript
 * const machine = new PageMachine({
 *   startPath: '/intro/start',
 *   routeMap: {
 *     [STATE_START]: '/intro/start',
 *     [STATE_PROFILE]: '/intro/profile'
 *   }
 * });
 *
 * // Sync machine state with URL changes
 * $effect(() => {
 *   machine.syncFromPath($page.url.pathname);
 * });
 * ```
 *
 * With onEnter hooks (for animations):
 * ```javascript
 * const machine = new PageMachine({
 *   startPath: '/game/animate',
 *   routeMap: {
 *     [STATE_ANIMATE]: '/game/animate',
 *     [STATE_PLAY]: '/game/play'
 *   },
 *   onEnterHooks: {
 *     [STATE_ANIMATE]: (done) => {
 *       const animation = playAnimation(1000);
 *       animation.finished.then(() => done(STATE_PLAY));
 *
 *       return {
 *         abort: () => animation.cancel(),
 *         complete: () => animation.finish()
 *       };
 *     }
 *   }
 * });
 *
 * // Fast-forward animation
 * machine.completeTransitions();
 *
 * // Cancel animation
 * machine.abortTransitions();
 * ```
 */
export default class PageMachine {
	/**
	 * Logger instance for state machine
	 * @type {Logger}
	 */
	logger;
	/**
	 * Current state
	 * @type {string}
	 */
	// @ts-ignore
	#current = $state();

	/**
	 * Start path for this page machine
	 * @type {string}
	 */
	#startPath = '';

	/**
	 * Initial/start state (derived from startPath)
	 * @type {string}
	 */
	#startState = '';

	/**
	 * Map of states to route paths
	 * @type {Record<string, string>}
	 */
	#routeMap = {};

	/**
	 * Reverse map of route paths to states
	 * @type {Record<string, string>}
	 */
	#pathToStateMap = {};

	/**
	 * Data properties for business/domain state
	 * Can be initialized from server and synced back
	 * @type {Record<string, any>}
	 */
	#data = $state({});

	/**
	 * Track which states have been visited during this session
	 * Useful for showing first-time hints/tips
	 * @type {Set<string>}
	 */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#visitedStates = new Set();

	/**
	 * Revision counter for triggering reactivity
	 * @type {number}
	 */
	#revision = $state(0);

	/**
	 * Map of state names to onEnter hook configurations
	 * @type {Record<string, {onEnter: Function}>}
	 */
	#onEnterHooks = {};

	/**
	 * Current state's onEnter handler (abort/complete functions)
	 * @type {{abort?: Function, complete?: Function} | null}
	 */
	#currentOnEnterHandler = null;

	/**
	 * Current state's done callback
	 * @type {Function | null}
	 */
	#currentOnEnterDone = null;

	/**
	 * Flag to prevent concurrent state transitions
	 * @type {boolean}
	 */
	#isTransitioning = false;

	/**
	 * Constructor
	 *
	 * @param {Object} config - Configuration object
	 * @param {string} config.startPath
	 *   Start path for this route group (e.g., '/game/play')
	 * @param {Record<string, string>} [config.routeMap={}]
	 *   Map of states to route paths
	 * @param {Record<string, any>} [config.initialData={}]
	 *   Initial data properties (from server)
	 * @param {Record<string, Function>} [config.onEnterHooks={}]
	 *   Map of states to onEnter hook functions
	 * @param {string} [config.name='PageMachine']
	 *   Name for logger identification
	 * @param {import('$lib/logging/typedef.js').LogLevel} [config.logLevel]
	 *   Log level (defaults to INFO for state transitions)
	 *
	 * @example
	 * ```javascript
	 * const machine = new PageMachine({
	 *   startPath: '/intro/start',
	 *   routeMap: {
	 *     [STATE_START]: '/intro/start',
	 *     [STATE_ANIMATE]: '/intro/animate'
	 *   },
	 *   initialData: {
	 *     INTRO_COMPLETED: false
	 *   },
	 *   onEnterHooks: {
	 *     [STATE_ANIMATE]: (done) => {
	 *       setTimeout(() => done(STATE_START), 1000);
	 *       return {
	 *         abort: () => clearTimeout(...),
	 *         complete: () => done(STATE_START)
	 *       };
	 *     }
	 *   }
	 * });
	 * ```
	 */
	constructor({
		startPath,
		routeMap = {},
		initialData = {},
		onEnterHooks = {},
		name = 'PageMachine',
		logLevel = INFO
	}) {
		if (!startPath) {
			throw new Error('PageMachine requires startPath parameter');
		}

		this.logger = new Logger(name, logLevel);
		this.#startPath = startPath;
		this.#routeMap = routeMap;
		this.#data = initialData;
		this.#onEnterHooks = this.#normalizeOnEnterHooks(onEnterHooks);

		// Build reverse map (path -> state)
		for (const [state, path] of Object.entries(routeMap)) {
			this.#pathToStateMap[path] = state;
		}

		// Derive initial state from startPath
		const initialState = this.#pathToStateMap[startPath];
		if (!initialState) {
			throw new Error(
				`PageMachine: startPath "${startPath}" not found in routeMap`
			);
		}

		this.#startState = initialState;
		this.#current = initialState;

		// Mark initial state as visited
		this.#visitedStates.add(initialState);
	}

	/**
	 * Normalize onEnterHooks to ensure consistent format
	 * Converts function to {onEnter: function} object
	 *
	 * @param {Record<string, Function|Object>} hooks - Raw hooks configuration
	 * @returns {Record<string, {onEnter: Function}>} Normalized hooks
	 */
	#normalizeOnEnterHooks(hooks) {
		const normalized = {};

		for (const [state, hook] of Object.entries(hooks)) {
			if (typeof hook === 'function') {
				// Simple function -> wrap in object
				normalized[state] = { onEnter: hook };
			} else if (hook && typeof hook === 'object' && hook.onEnter) {
				// Already an object with onEnter
				normalized[state] = hook;
			}
		}

		return normalized;
	}

	/**
	 * Synchronize machine state with URL path
	 *
	 * Call this in a $effect that watches $page.url.pathname
	 * Automatically tracks visited states
	 *
	 * @param {string} currentPath - Current URL pathname
	 *
	 * @returns {boolean} True if state was changed
	 */
	syncFromPath(currentPath) {
		const targetState = this.#getStateFromPath(currentPath);

		if (targetState && targetState !== this.#current) {
			this.#current = targetState;
			this.#visitedStates.add(targetState);
			this.#revision++;
			return true;
		}

		return false;
	}

	/**
	 * Set the current state directly
	 * Handles onEnter hooks and auto-transitions
	 *
	 * @param {string} newState - Target state
	 */
	async setState(newState) {
		if (newState === this.#current || this.#isTransitioning) {
			return;
		}

		// Abort previous state's onEnter handler
		if (this.#currentOnEnterHandler?.abort) {
			this.#currentOnEnterHandler.abort();
		}
		this.#currentOnEnterHandler = null;
		this.#currentOnEnterDone = null;

		const oldState = this.#current;
		this.#isTransitioning = true;
		this.#current = newState;
		this.#visitedStates.add(newState);

		// Log state transition
		this.logger.debug(`${oldState} → ${newState}`);

		// Check if this state has an onEnter hook
		const hookConfig = this.#onEnterHooks[newState];
		if (hookConfig?.onEnter) {
			// Create done callback for auto-transition
			let doneCalled = false;
			const done = (nextState) => {
				if (!doneCalled && nextState && nextState !== newState) {
					doneCalled = true;
					this.#isTransitioning = false;
					this.setState(nextState);
				}
			};

			this.#currentOnEnterDone = done;

			// Call the onEnter hook
			try {
				const handler = hookConfig.onEnter(done);

				// Store abort/complete handlers if provided
				if (handler && typeof handler === 'object') {
					if (handler.abort || handler.complete) {
						this.#currentOnEnterHandler = {
							abort: handler.abort,
							complete: handler.complete
						};
					}
				}

				// If hook returned a promise, await it
				if (handler?.then) {
					await handler;
				}
			} catch (error) {
				console.error(`Error in onEnter hook for state ${newState}:`, error);
			}
		}

		this.#isTransitioning = false;
		this.#revision++;
	}

	/**
	 * Get state name from URL path
	 *
	 * @param {string} path - URL pathname
	 *
	 * @returns {string|null} State name or null
	 */
	#getStateFromPath(path) {
		// Try exact match first
		if (this.#pathToStateMap[path]) {
			return this.#pathToStateMap[path];
		}

		// Try partial match (path includes route)
		for (const [routePath, state] of Object.entries(this.#pathToStateMap)) {
			if (path.includes(routePath)) {
				return state;
			}
		}

		return null;
	}

	/**
	 * Get route path for a given state
	 *
	 * @param {string} state - State name
	 *
	 * @returns {string|null} Route path or null if no mapping
	 */
	getPathForState(state) {
		return this.#routeMap[state] || null;
	}

	/**
	 * Get route path for current state
	 *
	 * @returns {string|null} Route path or null if no mapping
	 */
	getCurrentPath() {
		return this.getPathForState(this.#current);
	}

	/**
	 * Get current state
	 *
	 * @returns {string} Current state name
	 */
	get current() {
		return this.#current;
	}

	/**
	 * Get the route map
	 *
	 * @returns {Record<string, string>} Copy of route map
	 */
	get routeMap() {
		return { ...this.#routeMap };
	}

	/* ===== Data Properties (Business/Domain State) ===== */

	/**
	 * Set a data property value
	 *
	 * @param {string} key - Property key
	 * @param {any} value - Property value
	 *
	 * @example
	 * ```javascript
	 * machine.setData('HAS_STRONG_PROFILE', true);
	 * machine.setData('PROFILE_SCORE', 85);
	 * ```
	 */
	setData(key, value) {
		this.#data[key] = value;
		this.#revision++;
	}

	/**
	 * Get a data property value
	 *
	 * @param {string} key - Property key
	 *
	 * @returns {any} Property value or undefined
	 *
	 * @example
	 * ```javascript
	 * const hasProfile = machine.getData('HAS_STRONG_PROFILE');
	 * const score = machine.getData('PROFILE_SCORE');
	 * ```
	 */
	getData(key) {
		// Access revision to ensure reactivity
		this.#revision;
		return this.#data[key];
	}

	/**
	 * Get all data properties
	 *
	 * @returns {Record<string, any>} Copy of all data
	 *
	 * @example
	 * ```javascript
	 * const allData = machine.getAllData();
	 * await playerService.saveData(allData);
	 * ```
	 */
	getAllData() {
		// Access revision to ensure reactivity
		this.#revision;
		return { ...this.#data };
	}

	/**
	 * Update multiple data properties at once
	 *
	 * @param {Record<string, any>} dataUpdates - Object with key-value pairs
	 *
	 * @example
	 * ```javascript
	 * machine.updateData({
	 *   HAS_STRONG_PROFILE: true,
	 *   PROFILE_SCORE: 85,
	 *   MATCHED_SECTOR: 'technology'
	 * });
	 * ```
	 */
	updateData(dataUpdates) {
		for (const [key, value] of Object.entries(dataUpdates)) {
			this.#data[key] = value;
		}
		this.#revision++;
	}

	/* ===== Visited States Tracking ===== */

	/**
	 * Check if a state has been visited
	 *
	 * @param {string} state - State name to check
	 *
	 * @returns {boolean} True if the state has been visited
	 *
	 * @example
	 * ```javascript
	 * if (machine.hasVisited(STATE_PROFILE)) {
	 *   // User has seen profile page, skip intro
	 * }
	 * ```
	 */
	hasVisited(state) {
		// Access revision to ensure reactivity
		this.#revision;
		return this.#visitedStates.has(state);
	}

	/**
	 * Get all visited states
	 *
	 * @returns {string[]} Array of visited state names
	 */
	getVisitedStates() {
		// Access revision to ensure reactivity
		this.#revision;
		return Array.from(this.#visitedStates);
	}

	/**
	 * Reset visited states tracking
	 * Useful for testing or resetting experience
	 */
	resetVisitedStates() {
		this.#visitedStates.clear();
		this.#visitedStates.add(this.#current);
		this.#revision++;
	}

	/* ===== Start Path Methods ===== */

	/**
	 * Get the start path
	 *
	 * @returns {string} Start path
	 */
	get startPath() {
		return this.#startPath;
	}

	/**
	 * Get the start state
	 *
	 * @returns {string} Start state name
	 */
	get startState() {
		return this.#startState;
	}

	/**
	 * Check if the supplied path matches the start path
	 *
	 * @param {string} path - Path to check
	 *
	 * @returns {boolean} True if path matches start path
	 *
	 * @example
	 * ```javascript
	 * if (machine.isStartPath('/game/play')) {
	 *   // User is on the start page
	 * }
	 * ```
	 */
	isStartPath(path) {
		return path === this.#startPath;
	}

	/**
	 * Check if currently on the start state
	 *
	 * @returns {boolean} True if current state is the start state
	 *
	 * @example
	 * ```javascript
	 * if (machine.isOnStartState) {
	 *   // Show onboarding
	 * }
	 * ```
	 */
	get isOnStartState() {
		return this.#current === this.#startState;
	}

	/**
	 * Navigate to the start path
	 *
	 * @example
	 * ```javascript
	 * // Redirect user to start
	 * machine.redirectToStartPath();
	 * ```
	 */
	redirectToStartPath() {
		// Import dynamically to avoid circular dependencies
		import('$src/lib/util/sveltekit.js').then(({ switchToPage }) => {
			switchToPage(this.#startPath);
		});
	}

	/* ===== Transition Control Methods ===== */

	/**
	 * Abort current state's transitions
	 * Cancels animations/operations immediately (incomplete state)
	 *
	 * @example
	 * ```javascript
	 * // User clicks "Cancel" button
	 * machine.abortTransitions();
	 * ```
	 */
	abortTransitions() {
		if (this.#currentOnEnterHandler?.abort) {
			this.#currentOnEnterHandler.abort();
			this.#currentOnEnterHandler = null;
			this.#currentOnEnterDone = null;
			this.#revision++;
		}
	}

	/**
	 * Complete current state's transitions immediately
	 * Fast-forwards animations/operations to completion (complete state)
	 *
	 * @example
	 * ```javascript
	 * // User clicks "Skip" or "Next" button
	 * machine.completeTransitions();
	 * ```
	 */
	completeTransitions() {
		if (this.#currentOnEnterHandler?.complete) {
			this.#currentOnEnterHandler.complete();
			this.#currentOnEnterHandler = null;
			this.#currentOnEnterDone = null;
			this.#revision++;
		}
	}

	/**
	 * Check if current state has transitions that can be completed
	 *
	 * @returns {boolean} True if completeTransitions() can be called
	 *
	 * @example
	 * ```svelte
	 * {#if machine.canCompleteTransitions}
	 *   <button onclick={() => machine.completeTransitions()}>Skip</button>
	 * {/if}
	 * ```
	 */
	get canCompleteTransitions() {
		this.#revision; // Ensure reactivity
		return !!this.#currentOnEnterHandler?.complete;
	}

	/**
	 * Check if current state has transitions that can be aborted
	 *
	 * @returns {boolean} True if abortTransitions() can be called
	 *
	 * @example
	 * ```svelte
	 * {#if machine.canAbortTransitions}
	 *   <button onclick={() => machine.abortTransitions()}>Cancel</button>
	 * {/if}
	 * ```
	 */
	get canAbortTransitions() {
		this.#revision; // Ensure reactivity
		return !!this.#currentOnEnterHandler?.abort;
	}
}
