<script>
  import { toStateClasses } from '$lib/util/design-system/index.js';
  import { useDragState } from './drag-state.svelte.js';

  import {
    IDLE,
    DRAGGING,
    DRAG_PREVIEW,
    DROPPING,
    DRAG_DISABLED
  } from '$lib/constants/state-labels/drag-states.js';

  const dragState = useDragState();

  /**
   * @type {{
   *   item: any,
   *   group?: string,
   *   source?: string,
   *   disabled?: boolean,
   *   dragDelay?: number,
   *   base?: string,
   *   classes?: string,
   *   children: import('svelte').Snippet,
   *   isDragging?: boolean,
   *   isDropping?: boolean,
   *   isDragPreview?: boolean,
   *   onDragStart?: (detail: {
   *     event: DragEvent,
   *     item: any,
   *     source: string,
   *     group: string
   *   }) => void,
   *   onDragging?: (detail: {
   *     event: DragEvent,
   *     item: any
   *   }) => void,
   *   onDragEnd?: (detail: {
   *     event: DragEvent,
   *     item: any,
   *     wasDropped: boolean
   *   }) => void,
   *   onDrop?: (detail: {
   *     event: DragEvent,
   *     item: any,
   *     wasDropped: boolean
   *   }) => void,
   *   canDrag?: (item: any) => boolean,
   *   [key: string]: any
   * }}
   */
  let {
    item,
    group = 'default',
    source = 'default',
    disabled = false,
    dragDelay = 0,
    base = '',
    classes = '',
    children,
    isDragging = $bindable(false),
    isDropping = $bindable(false),
    isDragPreview = $bindable(false),
    onDragStart,
    onDragging,
    onDragEnd,
    onDrop,
    canDrag = () => true,
    ...attrs
  } = $props();

  let dragTimeout = null;
  let currentState = $state(IDLE);

  // Computed state object for CSS classes
  let stateObject = $derived({
    idle: currentState === IDLE,
    dragging: currentState === DRAGGING,
    'drag-preview': currentState === DRAG_PREVIEW,
    dropping: currentState === DROPPING,
    'drag-disabled': disabled || !canDrag(item)
  });

  let stateClasses = $derived(toStateClasses(stateObject));

  // Update bindable props
  $effect(() => {
    isDragging = currentState === DRAGGING;
    isDropping = currentState === DROPPING;
    isDragPreview = currentState === DRAG_PREVIEW;
  });

  /**
   * Handle drag start
   * @param {DragEvent} event
   */
  function handleDragStart(event) {
    if (disabled || !canDrag(item)) {
      event.preventDefault();
      return;
    }

    // Handle drag delay
    if (dragDelay > 0) {
      event.preventDefault();
      currentState = DRAG_PREVIEW;

      dragTimeout = setTimeout(() => {
        currentState = DRAGGING;
        startDrag(event);
      }, dragDelay);
      return;
    }

    currentState = DRAGGING;
    startDrag(event);
  }

  /**
   * Start the drag operation
   * @param {DragEvent} event
   */
  function startDrag(event) {
    const dragData = {
      item,
      source,
      group,
      metadata: { timestamp: Date.now() }
    };

    // Set global drag state
    dragState.start(item, source, group);

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));

    // Set custom drag image if needed
    if (event.dataTransfer.setDragImage) {
      // Could set custom drag image here
    }

    onDragStart?.({ event, item, source, group });
  }

  /**
   * Handle during drag
   * @param {DragEvent} event
   */
  function handleDrag(event) {
    if (currentState === DRAGGING) {
      onDragging?.({ event, item });
    }
  }

  /**
   * Handle drag end
   * @param {DragEvent} event
   */
  function handleDragEnd(event) {
    clearTimeout(dragTimeout);

    // Clear global drag state
    dragState.end();

    // Check if drop was successful
    const wasDropped = event.dataTransfer.dropEffect !== 'none';

    if (wasDropped) {
      currentState = DROPPING;
      onDrop?.({ event, item, wasDropped: true });

      // Brief dropping state before returning to idle
      setTimeout(() => {
        currentState = IDLE;
      }, 100);
    } else {
      currentState = IDLE;
    }

    onDragEnd?.({ event, item, wasDropped });
  }

  /**
   * Handle mouse down for drag delay
   * @param {MouseEvent} event
   */
  function handleMouseDown(event) {
    if (dragDelay > 0 && !disabled && canDrag(item)) {
      // Could add visual feedback here
    }
  }

  /**
   * Handle mouse up to cancel drag delay
   * @param {MouseEvent} event
   */
  function handleMouseUp(event) {
    if (dragTimeout) {
      clearTimeout(dragTimeout);
      currentState = IDLE;
    }
  }
</script>

<div
  data-component="draggable"
  draggable={!disabled && canDrag(item)}
  ondragstart={handleDragStart}
  ondrag={handleDrag}
  ondragend={handleDragEnd}
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  class="{base} {classes} {stateClasses}"
  {...attrs}
>
  {@render children()}
</div>
