<script>
  import { onMount, onDestroy } from 'svelte';
  import { toStateClasses } from '$lib/util/design-system/index.js';

  import { createOrGetDragState } from './drag-state.svelte.js';

  import { GridLayers } from '$lib/components/layout';

  import {
    READY,
    DRAG_OVER,
    CAN_DROP,
    CANNOT_DROP
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
   *   minHeight?: string,
   *   maxHeight?: string,
   *   heightMode?: 'fixed' | 'flexible' | 'fill',
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
    minHeight = '',
    maxHeight = '',
    heightMode = 'fixed',
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

  // let debugEvents = [];

  const dragState = createOrGetDragState(contextKey);

  let currentState = $state(READY);

  let dropZoneElement = $state(null);

  // $effect( () => {
  //   if(dropZoneElement) {
  //     console.debug(dropZoneElement);
  //   }
  // } )

  let isCurrentlyOver = $state(false);

  // $inspect({ zone, isCurrentlyOver });

  // Cleanup function
  let cleanup;

  onMount(() => {
    // Global dragend listener to ensure state cleanup
    const handleGlobalDragEnd = () => {
      isCurrentlyOver = false;
      currentState = READY;
    };

    document.addEventListener('dragend', handleGlobalDragEnd);

    // console.debug(`DropZone ${zone} mounted`);

    cleanup = () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };

    return cleanup;
  });

  // Computed height classes based on mode
  let heightClasses = $derived.by(() => {
    const classes = [];

    switch (heightMode) {
      case 'flexible':
        // Flexible height with optional min/max constraints
        if (minHeight) classes.push(minHeight);
        else classes.push('min-h-[100px]'); // Default minimum
        if (maxHeight) {
          classes.push(maxHeight);
          classes.push('overflow-y-auto');
        }
        break;
      case 'fill':
        // Fill the parent container
        classes.push('h-full');
        break;
      case 'fixed':
      default:
        // Fixed height (default to min-height if not filling)
        classes.push('h-min');
        break;
    }

    return classes.join(' ');
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
    isDragOver = [DRAG_OVER, CAN_DROP, CANNOT_DROP].includes(currentState);

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
    if (disabled) return false;
    if (!data) return false;
    if (!accepts(data)) return false;
    return true;
  }

  /**
   * Get drag data from either drag state or handle file drops
   *
   * @param {DragEvent} event
   * @returns {Object|null} The drag data, or null for file drops
   */
  function getDragData(event) {
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
          // Get the original instance from drag state
          const dragData = dragState.getDraggableById(draggableId);
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
   * Handle drag enter with improved DOM traversal check
   * @param {DragEvent} event
   */
  function handleDragEnter(event) {
    // debugEvents.push({
    //   event: 'dragEnter',
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   isCurrentlyOver
    // });

    // console.log('dragEnter:', { zone });

    // Prevent default to allow drop
    event.preventDefault();

    // Check if mouse is actually within drop zone boundaries
    const rect = dropZoneElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    const isWithinBounds =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (!isWithinBounds) {
      // Don't enter if mouse is outside bounds
      // console.debug('Mouse outside bounds', {
      //   x,
      //   y,
      //   top: rect.top,
      //   bottom: rect.bottom,
      //   left: rect.left,
      //   right: rect.right
      // });

      // dropZoneElement.style.border = "solid 10px purple";
      return;
    }

    if (isCurrentlyOver) {
      // console.debug('Already over');
      return;
    }

    isCurrentlyOver = true;

    // Get the drag data
    const dragData = getDragData(event);

    // Update state based on acceptance
    if (dragData) {
      currentState = canAcceptDrop(dragData) ? CAN_DROP : CANNOT_DROP;
    } else {
      currentState = DRAG_OVER;
    }

    // Notify listeners
    onDragEnter?.({ event, zone, canDrop: currentState === CAN_DROP });
  }

  /**
   * Handle drag over
   * @param {DragEvent} event
   */
  function handleDragOver(event) {
    // console.log('dragOver', {zone}, event );
    // console.log('dragOver', {
    //     zone,
    //     eventTarget: event.target.closest('[data-zone]')?.dataset?.zone,
    //     currentTarget: event.currentTarget.dataset?.zone,
    //     path: event.composedPath().map(el => el.dataset?.zone || el.tagName)
    // });

    // debugEvents.push({
    //   event: 'handleDragOver',
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   isCurrentlyOver,
    //   contains: dropZoneElement.contains(event.target),
    //   mouseX: event.clientX,
    //   mouseY: event.clientY,
    //   dropZoneBounds: dropZoneElement.getBoundingClientRect()
    // });

    // console.log('dragOver:', {
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   isCurrentlyOver,
    //   contains: dropZoneElement.contains(event.target)
    // });

    // Check if mouse is actually within drop zone boundaries
    const rect = dropZoneElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    const isWithinBounds =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (!isWithinBounds) {
      // Mouse is outside bounds, treat as leave
      if (isCurrentlyOver) {
        isCurrentlyOver = false;
        currentState = READY;
        onDragLeave?.({ event, zone });
      }
      return;
    }

    // console.log('dragOver (accepted)', {zone});

    // Prevent default to allow drop
    event.preventDefault();

    // If we're not currently over this drop zone, treat it as an enter
    if (!isCurrentlyOver) {
      handleDragEnter(event);
      return;
    }

    // Get the drag data
    const dragData = getDragData(event);

    // Re-evaluate acceptance
    if (dragData && [DRAG_OVER, CAN_DROP, CANNOT_DROP].includes(currentState)) {
      currentState = canAcceptDrop(dragData) ? CAN_DROP : CANNOT_DROP;
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
    // debugEvents.push({
    //   event: 'handleDragLeave',
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   relatedTarget: event.relatedTarget,
    //   isCurrentlyOver,
    //   isActuallyLeaving: !event.relatedTarget || !dropZoneElement.contains(event.relatedTarget)
    // });

    // console.log('dragLeave:', {
    //   target: event.target,
    //   currentTarget: event.currentTarget,
    //   relatedTarget: event.relatedTarget,
    //   isCurrentlyOver,
    //   isActuallyLeaving: !event.relatedTarget || !dropZoneElement.contains(event.relatedTarget)
    // });

    // We need to check if we're actually leaving the drop zone or just
    // entering a child element within the drop zone

    // relatedTarget is the element we're moving to
    const relatedTarget = event.relatedTarget;

    // If relatedTarget is null or outside our drop zone, we're truly leaving
    const isActuallyLeaving =
      !relatedTarget || !dropZoneElement.contains(relatedTarget);

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
    // console.debug( JSON.stringify(debugEvents, null, 2));

    // Prevent default browser actions
    event.preventDefault();

    if (!isCurrentlyOver) {
      // Prevent drop if not currently over
      return;
    }

    // Reset our tracking state
    isCurrentlyOver = false;

    try {
      // Check if this is a file drop first
      if (event.dataTransfer.types.includes('Files')) {
        // Handle file drops
        const files = Array.from(event.dataTransfer.files);
        // console.log('Files dropped:', files);

        // You can add custom file handling here
        // For now, just reset state and return
        currentState = READY;
        return;
      }

      // Get drag data for internal drag operations
      const dragData = getDragData(event);

      // Check if we can accept this drop
      if (dragData && canAcceptDrop(dragData)) {
        // Notify listener
        onDropStart?.({ event, zone, data: dragData });

        const style = window.getComputedStyle(dropZoneElement);

        // Parse border widths from computed style
        const borderLeftWidth = parseInt(style.borderLeftWidth, 10) || 0;
        const borderTopWidth = parseInt(style.borderTopWidth, 10) || 0;

        // Get drop zone rectangle
        const dropZoneRect = dropZoneElement.getBoundingClientRect();

        // Calculate position with both dragData.offsetX/Y adjustment and border adjustment
        const dropOffsetX = event.clientX - dropZoneRect.left - borderLeftWidth;

        const dropOffsetY = event.clientY - dropZoneRect.top - borderTopWidth;

        const x = dropOffsetX - (dragData.offsetX ?? 0);
        const y = dropOffsetY - (dragData.offsetY ?? 0);

        const dropResult = onDrop?.({
          zone,
          source: dragData.source,
          item: dragData.item,
          x,
          y,
          drag: dragData,
          drop: {
            offsetX: dropOffsetX,
            offsetY: dropOffsetY,
            event
          }
        });

        // Handle async or sync results
        Promise.resolve(dropResult)
          .then(() => {
            currentState = READY;
            onDropEnd?.({ event, zone, data: dragData, success: true });
          })
          .catch((error) => {
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

  // console.log(`DropZone ${zone} script run`);
</script>
<div
  data-component="drop-zone"
  bind:this={dropZoneElement}
  ondragenter={handleDragEnter}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  class="{base} {heightClasses} {classes} {stateClasses}"
  data-zone={zone}
  {...attrs}
>
  <GridLayers heightFrom={heightMode === 'flexible' ? 'content' : null}>
    {#if children}
      <div
        data-layer="content"
        class:relative={heightMode === 'flexible'}
        class:w-full={heightMode === 'flexible'}
      >
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
  [data-layer='content']:not(.relative) {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  [data-layer='content'].relative {
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
