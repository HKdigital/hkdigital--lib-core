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
   * @param {string} draggableId
   * @returns {import('$lib/typedef/drag.js').DragData|undefined}
   */
  getDraggable(draggableId) {
    return this.draggables.get(draggableId);
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
