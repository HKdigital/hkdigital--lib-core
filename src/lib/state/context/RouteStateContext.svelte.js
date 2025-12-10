import { goto } from '$app/navigation';

/**
 * Base class for route state containers
 *
 * Main purposes:
 * - Container for route-level concerns (PageMachine, services, engines)
 * - Apply enforceStartPath to control navigation flow
 * - Provide validateAndRedirect for route protection
 *
 * @example
 * ```javascript
 * export class PuzzleState extends RouteStateContext {
 *   constructor() {
 *     super({
 *       startPath: '/puzzle',
 *       enforceStartPath: true
 *     });
 *   }
 *
 *   preload(onProgress) {
 *     return loadAudioAndVideoScenes(onProgress);
 *   }
 * }
 * ```
 */
export default class RouteStateContext {
	/**
	 * Start path for this route
	 * @type {string}
	 */
	#startPath;

	/**
	 * Whether to enforce that users visit start path before subroutes
	 * @type {boolean}
	 */
	#enforceStartPath = false;

	/**
	 * Track which paths have been visited during this session
	 * Used for enforceStartPath validation
	 * @type {Set<string>}
	 */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#visitedPaths = new Set();

	/**
	 * @param {Object} options - Configuration options
	 * @param {string} options.startPath - Start path for this route (required)
	 * @param {boolean} [options.enforceStartPath=false] - If true, redirect to start path before allowing subroutes
	 */
	constructor({ startPath, enforceStartPath = false }) {
		if (!startPath) {
			throw new Error(
				'RouteStateContext requires startPath parameter'
			);
		}

		this.#startPath = startPath;
		this.#enforceStartPath = enforceStartPath;
	}

	/**
	 * Determine if current path needs redirection
	 * Private method - enforces sequential access to subroutes
	 *
	 * @param {string} currentPath - Current URL pathname
	 *
	 * @returns {string|null}
	 *   Path to redirect to, or null if no redirect needed
	 */
	#determineRedirect(currentPath) {
		// No enforcement configured
		if (!this.#enforceStartPath) {
			return null;
		}

		// Currently on the start path - mark as visited and allow
		if (currentPath === this.#startPath) {
			this.#visitedPaths.add(currentPath);
			return null;
		}

		// On a subroute - check if start path was visited
		if (currentPath.startsWith(this.#startPath + '/')) {
			// Allow if user has visited the start path
			if (this.#visitedPaths.has(this.#startPath)) {
				return null;
			}
			// Redirect to start path if not visited yet
			return this.#startPath;
		}

		// Path is valid (not a subroute)
		return null;
	}

	/**
	 * Validate current path and redirect if needed
	 * Call this in a $effect in the layout
	 *
	 * @param {string} currentPath - Current URL pathname
	 * @param {string} [redirectUrl] - Optional redirect URL (defaults to startPath)
	 */
	validateAndRedirect(currentPath, redirectUrl = null) {
		const redirectPath = this.#determineRedirect(currentPath);

		if (redirectPath && redirectPath !== currentPath) {
			const targetPath = redirectUrl || redirectPath;

			console.debug(
				`[${this.constructor.name}] Redirecting: ${currentPath} → ${targetPath}`
			);

			goto(targetPath, { replaceState: true });
		}
	}
}
