import { goto } from '$app/navigation';

/**
 * Navigate to an internal path
 * - Replaces the current url
 *
 * @param {string} path - Pathname to navigate to
 */
export function switchToPage( path ) {
  // eslint-disable-next-line svelte/no-navigation-without-resolve
  goto( path, { replaceState: true } );
}
