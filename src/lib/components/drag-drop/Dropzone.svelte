<script>
  import { onMount, onDestroy } from 'svelte';
  import { toStateClasses } from '$lib/util/design-system/index.js';

  import { createOrGetDragState } from './drag-state.svelte.js';

  import {
    READY,
    DRAG_OVER,
    CAN_DROP,
    CANNOT_DROP,
    DROP_DISABLED,
    ACTIVE_DROP
  } from '$lib/constants/state-labels/drop-states.js';

  /**
   * @type {{
   *   zone?: string,
   *   group?: string,
   *   disabled?: boolean,
   *   accepts?: (item: any) => boolean,
   *   maxItems?: number,
   *   base?: string,
   *   classes?: string,
   *   children?: import('svelte').Snippet,
   *   contextKey?: import('$lib/typedef').ContextKey,
   *   empty?: import('svelte').Snippet,
   *   preview?: import('svelte').Snippet<[{
   *     item: any,
   *     source: string,
   *     group: string,
   *     metadata?: any
   *   }]>,
   *   isDragOver?: boolean,
   *   canDrop?: boolean,
   *   isDropping?: boolean,
   *   itemCount?: number,
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
   *   onDrop?: (detail: {
   *     event: DragEvent,
   *     zone: string,
   *     item: any,
   *     source: string,
   *     metadata?: any
   *   }) => any | Promise<any>,
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
    maxItems = Infinity,
    base = '',
    classes = '',
    children,
    contextKey,
    empty,
    preview,
    isDragOver = $bindable(false),
    canDrop = $bindable(false),
    isDropping = $bindable(false),
    itemCount = $bindable(0),
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
    'drop-disabled': disabled,
    'active-drop': currentState === ACTIVE_DROP
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
    isDropping = currentState === ACTIVE_DROP;
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
    if (itemCount >= maxItems) return false;
    return true;
  }

  /**
   * Handle drag enter with improved DOM traversal check
   * @param {DragEvent} event
   */
  function handleDragEnter(event) {
    // console.debug('dragEnter fired', { zone, group });

    // Prevent default to allow drop
    event.preventDefault();

    // If we're already in a drag-over state, don't reset anything
    if (isCurrentlyOver) return;

    // Now we're over this dropzone
    isCurrentlyOver = true;

    // Get the current drag data
    const dragData = dragState.current;

    // console.debug('dragData in handleDragEnter', dragData, dragState);

    // Update state based on acceptance
    if (dragData) {
      currentState = canAcceptDrop(dragData)
        ? CAN_DROP
        : CANNOT_DROP;
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
    // console.debug('dragOver fired', { zone, group });

    // Prevent default to allow drop
    event.preventDefault();

    // If we're not currently over this dropzone (despite dragover firing),
    // treat it as an enter event
    if (!isCurrentlyOver) {
      handleDragEnter(event);
      return;
    }

    // Re-evaluate acceptance on each dragover in case state changed
    const dragData = dragState.current;

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
      // Parse the JSON data from the dataTransfer object
      const data = JSON.parse(event.dataTransfer.getData('application/json'));

      // Check if we can accept this drop
      if (canAcceptDrop(data)) {
        // Update state and notify listeners
        currentState = ACTIVE_DROP;
        onDropStart?.({ event, zone, data });

        // Call the onDrop handler and handle Promise resolution
        const dropResult = onDrop?.({
          event,
          zone,
          item: data.item,
          source: data.source,
          metadata: data.metadata
        });

        // Handle async or sync results
        Promise.resolve(dropResult).then(() => {
          currentState = READY;
          onDropEnd?.({ event, zone, data, success: true });
        }).catch((error) => {
          currentState = READY;
          onDropEnd?.({ event, zone, data, success: false, error });
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
  class="{base} {classes} {stateClasses}"
  data-zone={zone}
  {...attrs}
>
  {#if children}
    {@render children()}
  {:else if currentState === CAN_DROP && preview}
    {@render preview(dragState.current)}
  {:else if itemCount === 0 && empty}
    {@render empty()}
  {:else}
    <div data-element="drop-zone-empty">Drop items here</div>
  {/if}
</div>
