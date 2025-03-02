/**
 * Generates state classes from an object of state variables
 *
 * @param {Object.<string, boolean>} stateObject
 *   Object with state names as keys and boolean values
 *
 * @returns {string} Space-separated string of state classes
 *
 * @example
 * // Returns "state-selected state-error"
 * toStateClasses({ selected: true, loading: false, error: true });
 */
export function toStateClasses(stateObject) {
  if (!stateObject || typeof stateObject !== 'object') {
    return '';
  }

  return Object.entries(stateObject)
    .filter((entry) => entry[1] === true)
    .map(([state]) => `state-${state}`)
    .join(' ');
}
