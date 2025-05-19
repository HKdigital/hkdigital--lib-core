// drag-state.svelte.js
import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

export class DragState {
  current = $state(null);

  // constructor() {
  //   console.debug('Create DragState');
  // }

  /**
   * @param {import('$lib/typedef/drag.js').DragData} dragData
   */
  start(dragData) {
    // console.debug('DragState:start', dragData);
    this.current = dragData;
  }

  end() {
    this.current = null;
  }

  isDragging() {
    return this.current !== null;
  }
}

export const [createOrGetDragState, createDragState, getDragState] =
  defineStateContext(DragState);
