<script>
  import { createDragState } from './drag-state.svelte.js';

  import { activeTouchMove, activeDragOver, activeDrop } from './actions.js';

  /**
   * @type {{
   *   contextKey?: import('$lib/state/context/typedef.js').ContextKey,
   *   base?: string,
   *   classes?: string,
   *   children: import('svelte').Snippet,
   *   [key: string]: any
   * }}
   */
  let { contextKey, base = '', classes = '', children, ...attrs } = $props();

  // Create the state context at this level to ensure all children
  // have access to the same state instance
  const dragState = createDragState(contextKey);

  /**
   * Handle drag enter at context level
   * @param {DragEvent} event
   */
  function onDragEnter(event) {
    event.preventDefault();
    dragState.updateActiveDropZone(event.clientX, event.clientY, event);
  }

/**
   * Handle drag over at context level
   * @param {DragEvent} event
   */
  function onDragOver(event) {
    event.preventDefault();
    dragState.updateActiveDropZone(event.clientX, event.clientY, event);

    // Set appropriate drop effect based on current drag operation
    if (dragState.isDragging()) {
      const activeZone = dragState.activeDropZone;
      if (activeZone) {
        const config = dragState.dropZones.get(activeZone);
        if (config?.canDrop) {
          event.dataTransfer.dropEffect = 'move';
        } else {
          event.dataTransfer.dropEffect = 'none';
        }
      } else {
        event.dataTransfer.dropEffect = 'none';
      }
    } else {
      // No internal drag operation, might be file drag
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  /**
   * Handle drag leave at context level
   * @param {DragEvent} event
   */
  function onDragLeave(event) {
    // Only handle if we're leaving the entire context
    const rect =
      /** @type {Element} */ (event.currentTarget).getBoundingClientRect();


    const x = event.clientX;
    const y = event.clientY;

    // Check if we're truly leaving the context bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      dragState.updateActiveDropZone(-1, -1, event);
    }
  }

  /**
   * Handle drop at context level
   * @param {DragEvent} event
   */
  function onDrop(event) {
    event.preventDefault();
    dragState.handleDropAtPoint(event.clientX, event.clientY, event);
  }

  /**
   * Handle drag end to clean up
   * @param {DragEvent} event
   */
  function onDragEnd(event) {
    // This will trigger cleanup in drag state
    dragState.updateActiveDropZone(-1, -1, event);
  }
</script>

<div
  data-component="drag-drop-context"
  ondragenter={onDragEnter}
  use:activeDragOver={onDragOver}
  ondragleave={onDragLeave}
  use:activeDrop={onDrop}
  ondragend={onDragEnd}
  use:activeTouchMove={(e) => {
    if (dragState.isDragging()) {
      e.preventDefault();
    }
  }}
  class="{base} {classes}"
  {...attrs}
>
  {@render children()}
</div>
