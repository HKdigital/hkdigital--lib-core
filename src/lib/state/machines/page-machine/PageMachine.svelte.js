/**
 * Base class for page state machines with URL route mapping
 *
 * Simple state tracker that maps states to URL routes.
 * Does NOT enforce FSM transitions - allows free navigation
 * (because users can navigate to any URL via browser).
 *
 * Features:
 * - State-to-route mapping and sync
 * - Data properties for business/domain state
 * - Visited states tracking
 *
 * Basic usage:
 * ```javascript
 * const machine = cityState.getOrCreatePageMachine('intro', IntroPageMachine);
 *
 * // Sync machine state with URL changes
 * $effect(() => {
 *   machine.syncFromPath($page.url.pathname);
 * });
 * ```
 *
 * With data properties (for business logic):
 * ```javascript
 * // Initialize with server data
 * const initialData = {
 *   HAS_STRONG_PROFILE: false,
 *   PROFILE_COMPLETED: false,
 *   MATCHED_SECTOR: null
 * };
 * const machine = new CircuitPageMachine(initialState, routeMap, initialData);
 *
 * // Read data
 * if (machine.getData('HAS_STRONG_PROFILE')) {
 *   // Show advanced content
 * }
 *
 * // Update data (triggers reactivity)
 * machine.setData('HAS_STRONG_PROFILE', true);
 *
 * // Check visited states
 * if (machine.hasVisited(STATE_PROFILE)) {
 *   // User has seen profile page before
 * }
 * ```
 */
export default class PageMachine {
	/**
	 * Current state
	 * @type {string}
	 */
	// @ts-ignore
	#current = $state();

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
	 * Constructor
	 *
	 * @param {string} initialState - Initial state name
	 * @param {Record<string, string>} routeMap - Map of states to route paths
	 * @param {Record<string, any>} [initialData={}] - Initial data properties (from server)
	 *
	 * @example
	 * ```javascript
	 * const routeMap = {
	 *   [STATE_MATCH]: '/city/intro/match',
	 *   [STATE_CIRCUIT]: '/city/intro/racecircuit'
	 * };
	 *
	 * const initialData = {
	 *   INTRO_COMPLETED: false,
	 *   PROFILE_SCORE: 0
	 * };
	 *
	 * const machine = new CityIntroPageMachine(STATE_START, routeMap, initialData);
	 * ```
	 */
	constructor(initialState, routeMap = {}, initialData = {}) {
		this.#current = initialState;
		this.#routeMap = routeMap;
		this.#data = initialData;

		// Build reverse map (path -> state)
		for (const [state, path] of Object.entries(routeMap)) {
			this.#pathToStateMap[path] = state;
		}

		// Mark initial state as visited
		this.#visitedStates.add(initialState);
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
	 *
	 * @param {string} newState - Target state
	 */
	setState(newState) {
		if (newState !== this.#current) {
			this.#current = newState;
		}
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
}
