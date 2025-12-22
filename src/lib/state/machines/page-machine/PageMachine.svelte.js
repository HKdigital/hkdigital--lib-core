/**
 * Route-aware data manager for page groups
 *
 * Tracks navigation within a route group and manages business/domain data.
 * Does NOT enforce transitions - allows free navigation via browser.
 *
 * Features:
 * - Current route tracking and synchronization
 * - Start path management
 * - Data properties for business/domain state
 * - Visited routes tracking
 *
 * Basic usage:
 * ```javascript
 * const machine = new PageMachine({
 *   startPath: '/intro/start',
 *   routes: ['/intro/start', '/intro/profile', '/intro/complete']
 * });
 *
 * // Sync machine with URL changes
 * $effect(() => {
 *   machine.syncFromPath($page.url.pathname);
 * });
 *
 * // Check current route
 * if (machine.current === '/intro/profile') {
 *   // Do something
 * }
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
	 * Data properties for business/domain state
	 * Can be initialized from server and synced back
	 * @type {Record<string, any>}
	 */
	#data = $state({});

	/**
	 * Track which routes have been visited during this session
	 * Useful for showing first-time hints/tips
	 * @type {Set<string>}
	 */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#visitedRoutes = new Set();

	/**
	 * Revision counter for triggering reactivity
	 * @type {number}
	 */
	#revision = $state(0);

	/**
	 * Constructor
	 *
	 * @param {Object} config - Configuration object
	 * @param {string} config.startPath
	 *   Start path for this route group (e.g., '/game/play')
	 * @param {string[]} [config.routes=[]]
	 *   Optional list of valid routes (for validation/dev tools)
	 * @param {Record<string, any>} [config.initialData={}]
	 *   Initial data properties (from server)
	 * @param {import('$lib/logging/client.js').Logger} [config.logger]
	 *   Logger instance (optional)
	 *
	 * @example
	 * ```javascript
	 * const machine = new PageMachine({
	 *   startPath: '/intro/start',
	 *   routes: ['/intro/start', '/intro/profile'],
	 *   initialData: {
	 *     INTRO_COMPLETED: false
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
		this.#data = initialData;
		this.#current = startPath;

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
			this.#revision++;

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
	 * @param {Record<string, any>} dataUpdates
	 *   Object with key-value pairs
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

	/* ===== Visited Routes Tracking ===== */

	/**
	 * Check if a route has been visited
	 *
	 * @param {string} route - Route path to check
	 *
	 * @returns {boolean} True if the route has been visited
	 *
	 * @example
	 * ```javascript
	 * if (machine.hasVisited('/intro/profile')) {
	 *   // User has seen profile page, skip intro
	 * }
	 * ```
	 */
	hasVisited(route) {
		// Access revision to ensure reactivity
		this.#revision;
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
	 * Get all visited routes
	 *
	 * @returns {string[]} Array of visited route paths
	 */
	getVisitedRoutes() {
		// Access revision to ensure reactivity
		this.#revision;
		return Array.from(this.#visitedRoutes);
	}

	/**
	 * Reset visited routes tracking
	 * Useful for testing or resetting experience
	 */
	resetVisitedRoutes() {
		this.#visitedRoutes.clear();
		this.#visitedRoutes.add(this.#current);
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
