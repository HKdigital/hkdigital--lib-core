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
 * - Dev data properties for dev-mode helpers (using SvelteMap)
 * - Visited routes tracking (using SvelteSet)
 * - Fine-grained reactivity without manual revision tracking
 *
 * Best practices:
 * - Use constants for routes: `const ROUTE_INTRO = '/intro/start'`
 * - Use KEY_ constants for data: `const KEY_SCORE = 'score'`
 * - Use KEY_DEV_ constants for dev data: `const KEY_DEV_AUTO_NAV = 'dev-auto-navigation'`
 *
 * Basic usage:
 * ```javascript
 * // Define constants
 * const ROUTE_INTRO = '/intro/start';
 * const KEY_SCORE = 'score';
 * const KEY_TUTORIAL_SEEN = 'tutorial-seen';
 * const KEY_DEV_AUTO_NAVIGATION = 'dev-auto-navigation';
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
 *
 * // Dev-mode helpers (only available in dev)
 * machine.setDevData(KEY_DEV_AUTO_NAVIGATION, true);
 * const autoNavEnabled = machine.getDevData(KEY_DEV_AUTO_NAVIGATION);
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
import { SvelteSet } from 'svelte/reactivity';
import { ReactiveDataStore } from '$lib/state/classes.js';

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
	 * Reactive data store for business/domain data
	 * @type {ReactiveDataStore}
	 */
	#data;

	/**
	 * Reactive data store for dev-mode helper data
	 * @type {ReactiveDataStore}
	 */
	#devData;

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
	 * @param {Record<string, any>} [config.initialDevData={}]
	 *   Initial dev data properties (use KEY_DEV_ constants for keys)
	 * @param {import('$lib/logging/client.js').Logger} [config.logger]
	 *   Logger instance (optional)
	 *
	 * @example
	 * ```javascript
	 * const ROUTE_INTRO = '/intro/start';
	 * const KEY_INTRO_COMPLETED = 'intro-completed';
	 * const KEY_SCORE = 'score';
	 * const KEY_DEV_AUTO_NAVIGATION = 'dev-auto-navigation';
	 *
	 * const machine = new PageMachine({
	 *   startPath: ROUTE_INTRO,
	 *   routes: [ROUTE_INTRO, '/intro/profile'],
	 *   initialData: {
	 *     [KEY_INTRO_COMPLETED]: false,
	 *     [KEY_SCORE]: 0
	 *   },
	 *   initialDevData: {
	 *     [KEY_DEV_AUTO_NAVIGATION]: false
	 *   }
	 * });
	 * ```
	 */
	constructor({ startPath, routes = [], initialData = {}, initialDevData = {}, logger = null }) {
		if (!startPath) {
			throw new Error('PageMachine requires startPath parameter');
		}

		this.logger = logger;
		this.#startPath = startPath;
		this.#routes = routes;
		this.#current = startPath;

		// Initialize reactive data structures
		this.#data = new ReactiveDataStore({
			initialData
		});

		this.#devData = new ReactiveDataStore({
			initialData: initialDevData,
			productionGuard: true,
			errorPrefix: 'Dev data key'
		});

		this.#visitedRoutes = new SvelteSet();

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
	 * Get the reactive data store
	 *
	 * Provides read-only access to the data store instance.
	 * Access all data methods through this property.
	 *
	 * @returns {ReactiveDataStore} The data store
	 *
	 * @example
	 * ```javascript
	 * const KEY_SCORE = 'score';
	 *
	 * // Set data
	 * machine.data.set(KEY_SCORE, 100);
	 *
	 * // Get data (reactive)
	 * $effect(() => {
	 *   const score = machine.data.get(KEY_SCORE);
	 *   console.log('Score:', score);
	 * });
	 *
	 * // Other operations
	 * machine.data.update({ [KEY_SCORE]: 200 });
	 * machine.data.has(KEY_SCORE);
	 * machine.data.delete(KEY_SCORE);
	 * machine.data.clear();
	 * console.log(machine.data.size);
	 * ```
	 */
	get data() {
		return this.#data;
	}

	/* ===== Dev Data Properties (Dev-Mode Helpers) ===== */

	/**
	 * Get the reactive dev data store
	 *
	 * Provides read-only access to the dev data store instance.
	 * Access all dev data methods through this property.
	 *
	 * Dev data is only available in development mode. In production:
	 * - SET operations are silent no-ops
	 * - GET/HAS operations throw errors (programming errors)
	 *
	 * @returns {ReactiveDataStore} The dev data store
	 *
	 * @example
	 * ```javascript
	 * const KEY_DEV_AUTO_NAV = 'dev-auto-navigation';
	 *
	 * // Set dev data (no-op in production)
	 * machine.devData.set(KEY_DEV_AUTO_NAV, true);
	 *
	 * // Get dev data (throws in production)
	 * $effect(() => {
	 *   const autoNav = machine.devData.get(KEY_DEV_AUTO_NAV);
	 *   console.log('Auto-nav:', autoNav);
	 * });
	 *
	 * // Other operations
	 * machine.devData.update({ [KEY_DEV_AUTO_NAV]: false });
	 * machine.devData.has(KEY_DEV_AUTO_NAV);
	 * machine.devData.delete(KEY_DEV_AUTO_NAV);
	 * machine.devData.clear();
	 * console.log(machine.devData.size);
	 * ```
	 */
	get devData() {
		return this.#devData;
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
