<script>
  import { onMount, onDestroy } from 'svelte';
  import { toStateClasses } from '$lib/util/design-system/index.js';

  import { createOrGetDragState } from './drag-state.svelte.js';

  import { GridLayers } from '$lib/components/layout';

  import {
    // findDraggableSource,
    getDraggableIdFromEvent,
    // processDropWithData
  } from './util.js';

  import {
    READY,
    DRAG_OVER,
    CAN_DROP,
    CANNOT_DROP,
    // DROP_DISABLED
  } from '$lib/constants/state-labels/drop-states.js';

  /** @typedef {import('$lib/typedef').DragData} DragData */
  /** @typedef {import('$lib/typedef').DropData} DropData */

  /**
   * @type {{
   *   zone?: string,
   *   group?: string,
   *   disabled?: boolean,
   *   accepts?: (item: any) => boolean,
   *   base?: string,
   *   classes?: string,
   *   height?: string,
   *   autoHeight?: boolean,
   *   children?: import('svelte').Snippet,
   *   contextKey?: import('$lib/typedef').ContextKey,
   *   dropPreviewSnippet?: import('svelte').Snippet<[DragData]>,
   *   isDragOver?: boolean,
   *   canDrop?: boolean,
   *   onDragEnter?: (detail: {
   *     event: DragEvent,
   *     zone: string,
   *     canDrop: boolean
   *   }) => void,
   *   onDragOver?: (detail: {
   *     event: DragEvent,
   *     zone: string
   *   }) => void,
   *   onDragLeave?: (detail: {
   *     event: DragEvent,
   *     zone: string
   *   }) => void,
   *   onDrop?: (detail: DropData) => any | Promise<any>,
   *   onDropStart?: (detail: {
   *     event: DragEvent,
   *     zone: string,
   *     data: any
   *   }) => void,
   *   onDropEnd?: (detail: {
   *     event: DragEvent,
   *     zone: string,
   *     data: any,
   *     success: boolean,
   *     error?: Error
   *   }) => void,
   *   [key: string]: any
   * }}
   */
  let {
    zone = 'default',
    group = 'default',
    disabled = false,
    accepts = () => true,
    base = '',
    classes = '',
    height = 'h-min',
    autoHeight= false,
    children,
    contextKey,
    dropPreviewSnippet,
    isDragOver = $bindable(false),
    canDrop = $bindable(false),
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onDropStart,
    onDropEnd,
    ...attrs
  } = $props();


  const dragState = createOrGetDragState(contextKey);

  // console.debug('DropZone contextKey:', contextKey);

  let currentState = $state(READY);
  let dropzoneElement; // Reference to the dropzone DOM element

  // We'll use a flag to track if we're currently in the dropzone
  // without relying on a counter approach
  let isCurrentlyOver = $state(false);

  // Cleanup function
  let cleanup;

  onMount(() => {
    // Global dragend listener to ensure state cleanup
    const handleGlobalDragEnd = () => {
      isCurrentlyOver = false;
      currentState = READY;
    };

    document.addEventListener('dragend', handleGlobalDragEnd);

    cleanup = () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  });

  onDestroy(() => {
    cleanup?.();
  });

  // Computed state object for CSS classes
  let stateObject = $derived({
    ready: currentState === READY,
    'drag-over': currentState === DRAG_OVER,
    'can-drop': currentState === CAN_DROP,
    'cannot-drop': currentState === CANNOT_DROP,
    'drop-disabled': disabled
  });

  let stateClasses = $derived(toStateClasses(stateObject));

  // Update bindable props
  $effect(() => {
    isDragOver = [
      DRAG_OVER,
      CAN_DROP,
      CANNOT_DROP
    ].includes(currentState);

    canDrop = currentState === CAN_DROP;
  });

  /**
   * Check if we can accept the dragged item
   *
   * @param {Object} data
   *
   * @returns {boolean}
   */
  function canAcceptDrop(data) {
    // console.debug('canAcceptDrop', data, {group});

    if (disabled) return false;
    if (!data) return false;
    if (data.group !== group) return false;
    if (!accepts(data.item)) return false;
    return true;
  }

/**
 * Handle drag enter with improved DOM traversal check
 * @param {DragEvent} event
 */
function handleDragEnter(event) {
  // Prevent default to allow drop
  event.preventDefault();

  // If we're already in a drag-over state, don't reset anything
  if (isCurrentlyOver) return;

  // Now we're over this dropzone
  isCurrentlyOver = true;

  // Get the draggable ID from the event
  const draggableId = getDraggableIdFromEvent(event);

  if (draggableId) {
    // Get the drag data for this specific draggable
    const dragData = dragState.getDraggable(draggableId);

    // Update state based on acceptance
    if (dragData) {
      currentState = canAcceptDrop(dragData)
        ? CAN_DROP
        : CANNOT_DROP;
    } else {
      currentState = DRAG_OVER;
    }
  } else {
    // Fallback to the current drag data (for compatibility)
    const dragData = dragState.current;

    if (dragData) {
      currentState = canAcceptDrop(dragData)
        ? CAN_DROP
        : CANNOT_DROP;
    } else {
      currentState = DRAG_OVER;
    }
  }

  // Notify listeners
  onDragEnter?.({ event, zone, canDrop: currentState === CAN_DROP });
}

/**
 * Handle drag over
 * @param {DragEvent} event
 */
function handleDragOver(event) {
  // Prevent default to allow drop
  event.preventDefault();

  // If we're not currently over this dropzone (despite dragover firing),
  // treat it as an enter event
  if (!isCurrentlyOver) {
    handleDragEnter(event);
    return;
  }

  // Get the draggable ID from the event
  const draggableId = getDraggableIdFromEvent(event);
  let dragData;

  if (draggableId) {
    // Get the drag data for this specific draggable
    dragData = dragState.getDraggable(draggableId);
  } else {
    // Fallback to the current drag data (for compatibility)
    dragData = dragState.current;
  }

  // Re-evaluate acceptance
  if (dragData && [DRAG_OVER, CAN_DROP, CANNOT_DROP].includes(currentState)) {
    currentState = canAcceptDrop(dragData)
      ? CAN_DROP
      : CANNOT_DROP;
  }

  // Set visual feedback based on drop acceptance
  if (currentState === CAN_DROP) {
    event.dataTransfer.dropEffect = 'move';
  } else if (currentState === CANNOT_DROP) {
    event.dataTransfer.dropEffect = 'none';
  }

  // Notify listeners
  onDragOver?.({ event, zone });
}

  /**
   * Handle drag leave with improved DOM traversal check
   * @param {DragEvent} event
   */
  function handleDragLeave(event) {
    // We need to check if we're actually leaving the dropzone or just
    // entering a child element within the dropzone

    // relatedTarget is the element we're moving to
    const relatedTarget = event.relatedTarget;

    // If relatedTarget is null or outside our dropzone, we're truly leaving
    const isActuallyLeaving = !relatedTarget ||
                             !dropzoneElement.contains(relatedTarget);

    if (isActuallyLeaving) {
      isCurrentlyOver = false;
      currentState = READY;
      onDragLeave?.({ event, zone });
    }
  }

/**
 * Handle drop
 * @param {DragEvent} event
 */
function handleDrop(event) {
  // Prevent default browser actions
  event.preventDefault();

  // Reset our tracking state
  isCurrentlyOver = false;

  try {
    // First try to get the draggable ID from the event
    const draggableId = getDraggableIdFromEvent(event);
    let dragData;

    if (draggableId) {
      // Get the drag data from state using the draggable ID
      dragData = dragState.getDraggable(draggableId);
    }

    // If we couldn't get it from the element attribute, try dataTransfer
    if (!dragData) {
      // Parse the JSON data from the dataTransfer object (only works during drop)
      const jsonData = event.dataTransfer.getData('application/json');
      if (jsonData) {
        dragData = JSON.parse(jsonData);
      }
    }

    // Check if we can accept this drop
    if (dragData && canAcceptDrop(dragData)) {
      // Notify listener
      onDropStart?.({ event, zone, data: dragData });

      const style = window.getComputedStyle(dropzoneElement);

      // Parse border widths from computed style
      const borderLeftWidth = parseInt(style.borderLeftWidth, 10) || 0;
      const borderTopWidth = parseInt(style.borderTopWidth, 10) || 0;

      // Get dropzone rectangle
      const dropzoneRect = dropzoneElement.getBoundingClientRect();

      // Calculate position with both dragData.offsetX/Y adjustment and border adjustment
      // This combines your current approach with the border adjustment
      const offsetX = event.clientX - dropzoneRect.left - borderLeftWidth - (dragData.offsetX ?? 0);

      const offsetY = event.clientY - dropzoneRect.top - borderTopWidth - (dragData.offsetY ?? 0);

      // console.debug("dragData", dragData);

      const dropResult = onDrop?.({
        event,
        offsetX,
        offsetY,
        zone,
        item: dragData.item,
        source: dragData.source,
        metadata: dragData.metadata
      });

      // Handle async or sync results
      Promise.resolve(dropResult).then(() => {
        currentState = READY;
        onDropEnd?.({ event, zone, data: dragData, success: true });
      }).catch((error) => {
        currentState = READY;
        onDropEnd?.({ event, zone, data: dragData, success: false, error });
      });
    } else {
      // Not a valid drop, reset state
      currentState = READY;
    }
  } catch (error) {
    // Handle parsing errors
    console.error('Drop error:', error);
    currentState = READY;
  }
}
</script>

<div
  data-component="dropzone"
  bind:this={dropzoneElement}
  ondragenter={handleDragEnter}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  class="{base} {height} {classes} {stateClasses}"
  data-zone={zone}
  {...attrs}
>
  <GridLayers heightFrom={autoHeight ? 'content' : null}>
    {#if children}
      <div data-layer="content" class:auto-height={autoHeight}>
        {@render children()}
      </div>
    {/if}

    {#if currentState === CAN_DROP && dropPreviewSnippet}
      <div data-layer="preview">
        {@render dropPreviewSnippet(dragState.current)}
      </div>
    {/if}
  </GridLayers>
</div>

<style>
  [data-layer='content']:not(.auto-height) {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  [data-layer='content'].auto-height {
    position: relative;
    width: 100%;
  }

  [data-layer='preview'] {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
