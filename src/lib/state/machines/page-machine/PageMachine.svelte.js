/**
 * Route-aware data manager for page groups
 *
 * Tracks navigation within a route group and manages business/domain data.
 * Does NOT enforce transitions - allows free navigation via browser.
 *
 * Features:
 * - Current route tracking and synchronization
 * - Start path management
 * - Data properties for business/domain state (using SvelteMap)
 * - Visited routes tracking (using SvelteSet)
 * - Fine-grained reactivity without manual revision tracking
 *
 * Best practices:
 * - Use constants for routes: `const ROUTE_INTRO = '/intro/start'`
 * - Use KEY_ constants for data: `const KEY_SCORE = 'score'`
 *
 * Basic usage:
 * ```javascript
 * // Define constants
 * const ROUTE_INTRO = '/intro/start';
 * const KEY_SCORE = 'score';
 * const KEY_TUTORIAL_SEEN = 'tutorial-seen';
 *
 * const machine = new PageMachine({
 *   startPath: ROUTE_INTRO,
 *   routes: [ROUTE_INTRO, '/intro/profile', '/intro/complete'],
 *   initialData: {
 *     [KEY_SCORE]: 0,
 *     [KEY_TUTORIAL_SEEN]: false
 *   }
 * });
 *
 * // Sync machine with URL changes
 * $effect(() => {
 *   machine.syncFromPath($page.url.pathname);
 * });
 *
 * // Check current route (reactive)
 * $effect(() => {
 *   if (machine.current === ROUTE_INTRO) {
 *     console.log('On intro page');
 *   }
 * });
 *
 * // Access data (reactive, fine-grained)
 * $effect(() => {
 *   const score = machine.getData(KEY_SCORE);
 *   console.log('Score changed:', score);
 * });
 * ```
 *
 * Animations and page-specific logic should use $effect in pages:
 * ```javascript
 * // In +page.svelte
 * const animations = new PageAnimations();
 *
 * $effect(() => {
 *   if (someCondition) {
 *     animations.start();
 *   }
 * });
 * ```
 */
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export default class PageMachine {
	/**
	 * Logger instance
	 * @type {import('$lib/logging/client.js').Logger}
	 */
	logger;

	/**
	 * Current route path
	 * @type {string}
	 */
	// @ts-ignore
	#current = $state();

	/**
	 * Start path for this route group
	 * @type {string}
	 */
	#startPath = '';

	/**
	 * Optional list of valid routes for this group
	 * @type {string[]}
	 */
	#routes = [];

	/**
	 * Reactive map for business/domain data
	 * Uses SvelteMap for fine-grained reactivity
	 * @type {SvelteMap<string, any>}
	 */
	#data;

	/**
	 * Reactive set for visited routes
	 * Uses SvelteSet for automatic reactivity
	 * @type {SvelteSet<string>}
	 */
	#visitedRoutes;

	/**
	 * Constructor
	 *
	 * @param {Object} config - Configuration object
	 * @param {string} config.startPath
	 *   Start path for this route group (e.g., '/game/play')
	 * @param {string[]} [config.routes=[]]
	 *   Optional list of valid routes (for validation/dev tools)
	 * @param {Record<string, any>} [config.initialData={}]
	 *   Initial data properties (use KEY_ constants for keys)
	 * @param {import('$lib/logging/client.js').Logger} [config.logger]
	 *   Logger instance (optional)
	 *
	 * @example
	 * ```javascript
	 * const ROUTE_INTRO = '/intro/start';
	 * const KEY_INTRO_COMPLETED = 'intro-completed';
	 * const KEY_SCORE = 'score';
	 *
	 * const machine = new PageMachine({
	 *   startPath: ROUTE_INTRO,
	 *   routes: [ROUTE_INTRO, '/intro/profile'],
	 *   initialData: {
	 *     [KEY_INTRO_COMPLETED]: false,
	 *     [KEY_SCORE]: 0
	 *   }
	 * });
	 * ```
	 */
	constructor({ startPath, routes = [], initialData = {}, logger = null }) {
		if (!startPath) {
			throw new Error('PageMachine requires startPath parameter');
		}

		this.logger = logger;
		this.#startPath = startPath;
		this.#routes = routes;
		this.#current = startPath;

		// Initialize reactive data structures
		this.#data = new SvelteMap();
		this.#visitedRoutes = new SvelteSet();

		// Populate initial data
		for (const [key, value] of Object.entries(initialData)) {
			this.#data.set(key, value);
		}

		// Mark start path as visited
		this.#visitedRoutes.add(startPath);
	}

	/**
	 * Synchronize machine with URL path
	 *
	 * Call this in a $effect that watches $page.url.pathname.
	 * Automatically tracks visited routes.
	 *
	 * @param {string} currentPath - Current URL pathname
	 *
	 * @returns {boolean} True if route was changed
	 */
	syncFromPath(currentPath) {
		// Find matching route
		const matchedRoute = this.#findMatchingRoute(currentPath);

		if (matchedRoute && matchedRoute !== this.#current) {
			this.logger?.debug(`syncFromPath: ${currentPath} → ${matchedRoute}`);

			const oldRoute = this.#current;
			this.#current = matchedRoute;
			this.#visitedRoutes.add(matchedRoute);

			this.logger?.debug(`Route changed: ${oldRoute} → ${matchedRoute}`);

			return true;
		}

		return false;
	}

	/**
	 * Find matching route from path
	 *
	 * @param {string} path - URL pathname
	 *
	 * @returns {string|null} Matched route or null
	 */
	#findMatchingRoute(path) {
		// If routes list provided, try to match against it
		if (this.#routes.length > 0) {
			// Try exact match first
			if (this.#routes.includes(path)) {
				return path;
			}

			// Try partial match (path starts with route)
			for (const route of this.#routes) {
				if (path.startsWith(route)) {
					return route;
				}
			}

			return null;
		}

		// No routes list - accept any path
		return path;
	}

	/**
	 * Get current route
	 *
	 * @returns {string} Current route path
	 */
	get current() {
		return this.#current;
	}

	/**
	 * Get the routes list
	 *
	 * @returns {string[]} Copy of routes list
	 */
	get routes() {
		return [...this.#routes];
	}

	/* ===== Data Properties (Business/Domain State) ===== */

	/**
	 * Set a data property value
	 *
	 * Automatically reactive - effects watching this key will re-run.
	 * Uses fine-grained reactivity, so only effects watching this specific
	 * key will be triggered.
	 *
	 * @param {string} key - Property key (use KEY_ constant)
	 * @param {any} value - Property value
	 *
	 * @example
	 * ```javascript
	 * const KEY_HAS_STRONG_PROFILE = 'has-strong-profile';
	 * const KEY_PROFILE_SCORE = 'profile-score';
	 *
	 * machine.setData(KEY_HAS_STRONG_PROFILE, true);
	 * machine.setData(KEY_PROFILE_SCORE, 85);
	 * ```
	 */
	setData(key, value) {
		this.#data.set(key, value);
	}

	/**
	 * Get a data property value
	 *
	 * Automatically reactive - creates a dependency on this specific key.
	 * The effect will only re-run when THIS key changes, not when other
	 * keys change.
	 *
	 * @param {string} key - Property key (use KEY_ constant)
	 *
	 * @returns {any} Property value or undefined
	 *
	 * @example
	 * ```javascript
	 * const KEY_SCORE = 'score';
	 *
	 * // Reactive - re-runs only when KEY_SCORE changes
	 * $effect(() => {
	 *   const score = machine.getData(KEY_SCORE);
	 *   console.log('Score:', score);
	 * });
	 * ```
	 */
	getData(key) {
		return this.#data.get(key);
	}

	/**
	 * Get all data properties as plain object
	 *
	 * Note: This returns a snapshot (plain object), not a reactive map.
	 * Use this for serialization or server sync, not for reactive tracking.
	 *
	 * @returns {Record<string, any>} Plain object with all data
	 *
	 * @example
	 * ```javascript
	 * const allData = machine.getAllData();
	 * await playerService.saveData(allData);
	 * ```
	 */
	getAllData() {
		return Object.fromEntries(this.#data);
	}

	/**
	 * Update multiple data properties at once
	 *
	 * Each property update triggers fine-grained reactivity.
	 *
	 * @param {Record<string, any>} dataUpdates
	 *   Object with key-value pairs (use KEY_ constants for keys)
	 *
	 * @example
	 * ```javascript
	 * const KEY_HAS_STRONG_PROFILE = 'has-strong-profile';
	 * const KEY_PROFILE_SCORE = 'profile-score';
	 * const KEY_MATCHED_SECTOR = 'matched-sector';
	 *
	 * machine.updateData({
	 *   [KEY_HAS_STRONG_PROFILE]: true,
	 *   [KEY_PROFILE_SCORE]: 85,
	 *   [KEY_MATCHED_SECTOR]: 'technology'
	 * });
	 * ```
	 */
	updateData(dataUpdates) {
		for (const [key, value] of Object.entries(dataUpdates)) {
			this.#data.set(key, value);
		}
	}

	/**
	 * Delete a data property
	 *
	 * @param {string} key - Property key to delete (use KEY_ constant)
	 *
	 * @returns {boolean} True if the key existed and was deleted
	 *
	 * @example
	 * ```javascript
	 * const KEY_TEMPORARY_FLAG = 'temporary-flag';
	 *
	 * machine.deleteData(KEY_TEMPORARY_FLAG);
	 * ```
	 */
	deleteData(key) {
		return this.#data.delete(key);
	}

	/**
	 * Check if data property exists
	 *
	 * @param {string} key - Property key to check (use KEY_ constant)
	 *
	 * @returns {boolean} True if the key exists
	 *
	 * @example
	 * ```javascript
	 * const KEY_TUTORIAL_SEEN = 'tutorial-seen';
	 *
	 * if (machine.hasData(KEY_TUTORIAL_SEEN)) {
	 *   // Skip tutorial
	 * }
	 * ```
	 */
	hasData(key) {
		return this.#data.has(key);
	}

	/**
	 * Clear all data properties
	 *
	 * @example
	 * ```javascript
	 * machine.clearData();  // Reset all game data
	 * ```
	 */
	clearData() {
		this.#data.clear();
	}

	/**
	 * Get number of data properties
	 *
	 * @returns {number} Number of data entries
	 */
	get dataSize() {
		return this.#data.size;
	}

	/* ===== Visited Routes Tracking ===== */

	/**
	 * Check if a route has been visited
	 *
	 * Automatically reactive - creates a dependency on the visited routes set.
	 *
	 * @param {string} route - Route path to check
	 *
	 * @returns {boolean} True if the route has been visited
	 *
	 * @example
	 * ```javascript
	 * // Reactive - re-runs when visited routes change
	 * $effect(() => {
	 *   if (machine.hasVisited('/intro/profile')) {
	 *     console.log('User has seen profile page');
	 *   }
	 * });
	 * ```
	 */
	hasVisited(route) {
		return this.#visitedRoutes.has(route);
	}

	/**
	 * Check if the start route has been visited
	 *
	 * @returns {boolean} True if the start route has been visited
	 *
	 * @example
	 * ```javascript
	 * if (machine.hasVisitedStart) {
	 *   // User has been to the start page
	 * }
	 * ```
	 */
	get hasVisitedStart() {
		return this.hasVisited(this.#startPath);
	}

	/**
	 * Get all visited routes as array
	 *
	 * Note: Returns a snapshot (plain array), not reactive.
	 *
	 * @returns {string[]} Array of visited route paths
	 */
	getVisitedRoutes() {
		return Array.from(this.#visitedRoutes);
	}

	/**
	 * Reset visited routes tracking
	 *
	 * Clears all visited routes and marks only the current route as visited.
	 *
	 * @example
	 * ```javascript
	 * machine.resetVisitedRoutes();  // Reset progress tracking
	 * ```
	 */
	resetVisitedRoutes() {
		this.#visitedRoutes.clear();
		this.#visitedRoutes.add(this.#current);
	}

	/**
	 * Get number of visited routes
	 *
	 * @returns {number} Number of routes visited
	 */
	get visitedRoutesCount() {
		return this.#visitedRoutes.size;
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
	 * Check if currently on the start path
	 *
	 * @returns {boolean} True if current route is the start path
	 *
	 * @example
	 * ```javascript
	 * if (machine.isOnStartPath) {
	 *   // Show onboarding
	 * }
	 * ```
	 */
	get isOnStartPath() {
		return this.#current === this.#startPath;
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
		import('$lib/util/sveltekit.js').then(({ switchToPage }) => {
			switchToPage(this.#startPath);
		});
	}
}
