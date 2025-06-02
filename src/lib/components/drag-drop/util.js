import { createOrGetDragState } from './drag-state.svelte.js';

/**
 * Find the source draggable element from an event
 *
 * @param {DragEvent} event
 * @returns {HTMLElement|null}
 */
export function findDraggableSource(event) {
  const target = /** @type {Element|EventTarget|null} */ (event.target);

  if (!(target instanceof Element)) {
    return null;
  }

  let element = /** @type {Element|null} */ (target);

  // Walk up the DOM tree
  while (element !== null && element !== document.body) {
    if (element.hasAttribute('data-id')) {
      // Return as HTMLElement if needed
      return /** @type {HTMLElement} */ (element);
    }

    element = element.parentElement;
  }

  return null;
}

/**
 * Get draggable ID from an event, if available
 * @param {DragEvent} event
 * @returns {string|null}
 */
export function getDraggableIdFromEvent(event) {
  const element = findDraggableSource(event);
  return element ? element.getAttribute('data-id') : null;
}

/**
 * Process a drop event with the provided data and handlers
 * @param {DragEvent} event
 * @param {any} data The drag data
 * @param {Object} options
 * @param {Function} options.onDropStart Optional drop start handler
 * @param {Function} options.onDrop Main drop handler
 * @param {Function} options.onDropEnd Optional drop end handler
 * @param {string} options.zone The drop zone identifier
 * @param {Function} options.setState Function to update component state
 * @returns {Promise<boolean>} Success status
 */
export async function processDropWithData(
  event,
  data,
  { onDropStart, onDrop, onDropEnd, zone, setState }
) {
  try {
    // Update state and notify listeners
    setState('ACTIVE_DROP');
    onDropStart?.({ event, zone, data });

    // Call the onDrop handler
    const dropResult = onDrop?.({
      event,
      zone,
      item: data.item,
      source: data.source,
      metadata: data.metadata
    });

    // Handle async or sync results
    await Promise.resolve(dropResult);

    // Success path
    setState('READY');
    onDropEnd?.({ event, zone, data, success: true });
    return true;
  } catch (error) {
    // Error path
    setState('READY');
    onDropEnd?.({ event, zone, data, success: false, error });
    return false;
  }
}
