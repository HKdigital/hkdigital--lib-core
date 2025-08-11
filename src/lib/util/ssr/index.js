/**
 * SSR context detection and prevention utilities
 */

/**
 * Detect if we're being called during SSR/build evaluation
 * This helps catch improper usage that causes serialization issues
 * 
 * @returns {boolean} True if in SSR context
 */
export function detectSSRContext() {
  // During development, check if this is module-level evaluation in server routes
  const stack = new Error().stack;
  
  if (stack) {
    // Look for server route files in the stack
    const serverRoutePattern = /\+(?:page|layout)\.server\.js|\+server\.js/;
    const hasServerRoute = serverRoutePattern.test(stack);
    
    // Be more aggressive - catch any server route context
    if (hasServerRoute) {
      return true;
    }
  }
  
  return false;
}

/**
 * Throws an error if called during SSR context with helpful guidance
 * 
 * @throws {Error} When called in SSR context
 */
export function expectNoSSRContext() {
  if (detectSSRContext()) {
    const errorMessage = `
╭─────────────────────────────────────────────────────────────╮
│             Code should not run in SSR Context              │
╰─────────────────────────────────────────────────────────────╯`;
    
    console.error(errorMessage);
    throw new Error('This code should not run in SSR context');
  }
}
