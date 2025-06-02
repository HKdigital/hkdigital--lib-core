// drag-state.svelte.js
import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

class DragState {
  // Replace the single 'current' with a Map of draggable IDs
  draggables = $state(new Map());

  /**
   * @param {string} draggableId
   * @param {import('$lib/typedef/drag.js').DragData} dragData
   */
  start(draggableId, dragData) {
    this.draggables.set(draggableId, dragData);
  }

  /**
   * @param {string} draggableId
   */
  end(draggableId) {
    this.draggables.delete(draggableId);
  }

  /**
   * Get a drag data by draggable id
   *
   * @param {string} draggableId
   * @returns {import('$lib/typedef/drag.js').DragData|undefined}
   */
  getDraggableById(draggableId) {
    return this.draggables.get(draggableId);
  }

  /**
   * Get a drag data. Extracts draggable id from the supplied DragEvent
   *
   * @param {DragEvent} event
   *
   * @returns {Object|null} The drag data, or null for file drops
   */
  getDraggable(event) {
    // Check if this is a file drop
    if (event.dataTransfer.types.includes('Files')) {
      // Handle file drop - you can extend this based on your needs
      // console.log('File drop detected:', event.dataTransfer.files);
      return null; // Return null to indicate this is not an internal drag
    }

    // Handle internal drag operations
    try {
      const jsonData = event.dataTransfer.getData('application/json');
      if (jsonData) {
        const transferData = JSON.parse(jsonData);
        const draggableId = transferData.draggableId;

        if (draggableId) {
          const dragData = this.getDraggableById(draggableId);
          if (dragData) {
            return dragData;
          }
        }
      }
    } catch (error) {
      console.error('Error getting drag data:', error);
    }

    return null;
  }

  /**
   * Get the most recently started drag operation (convenience method)
   * @returns {import('$lib/typedef/drag.js').DragData|undefined}
   */
  get current() {
    // For backward compatibility with existing code
    const entries = Array.from(this.draggables.entries());
    return entries.length > 0 ? entries[entries.length - 1][1] : undefined;
  }

  /**
   * @returns {boolean}
   */
  isDragging() {
    return this.draggables.size > 0;
  }
}

export const [createOrGetDragState, createDragState, getDragState] =
  defineStateContext(DragState);
