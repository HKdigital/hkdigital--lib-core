/**
 * Simple utility for tracking combined loading progress across multiple components
 *
 * @typedef {Object} LoadingProgress
 * @property {number} bytesLoaded - Number of bytes loaded
 * @property {number} size - Total size in bytes
 * @property {boolean} loaded - Whether loading is complete
 */

/**
 * Creates a loading tracker that combines progress from multiple sources
 *
 * @returns {Object} Loading tracker instance
 */
export function createTracker() {
  // Store progress for each item by ID
  const items = new Map();

  // Computed values
  let totalBytesLoaded = 0;
  let totalSize = 0;
  let allLoaded = false;
  let progressPercent = 0;

  /**
   * Update the totals based on current items
   */
  function updateTotals() {
    let bytesLoaded = 0;
    let size = 0;
    let loaded = items.size > 0;

    // Loop through all items and sum values
    for (const progress of items.values()) {
      bytesLoaded += progress.bytesLoaded || 0;
      size += progress.size || 0;

      if (!progress.loaded) {
        loaded = false;
      }
    }

    // Update state
    totalBytesLoaded = bytesLoaded;
    totalSize = size;
    allLoaded = items.size > 0 ? loaded : false;
    progressPercent = size > 0 ? Math.round((bytesLoaded / size) * 100) : 0;
  }

  /**
   * Track progress for a component
   *
   * @param {LoadingProgress} progress - The progress update
   * @param {string|Symbol} id - The component identifier
   */
  function track(progress, id) {
    if (progress && id) {
      items.set(id, progress);
      updateTotals();
    }
  }

  /**
   * Remove an item from tracking
   *
   * @param {string|Symbol} id - Item identifier to remove
   */
  function remove(id) {
    if (items.has(id)) {
      items.delete(id);
      updateTotals();
    }
  }

  /**
   * Reset the tracker, clearing all items
   */
  function reset() {
    items.clear();
    updateTotals();
  }

  // Return the public API
  return {
    track,
    remove,
    reset,

    // Read-only properties
    get state() {
      return {
        bytesLoaded: totalBytesLoaded,
        size: totalSize,
        loaded: allLoaded,
        percent: progressPercent,
        itemCount: items.size
      };
    },

    get loaded() {
      return allLoaded;
    },

    get percent() {
      return progressPercent;
    }
  };
}
