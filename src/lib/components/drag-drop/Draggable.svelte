<script>
  import { toStateClasses } from '$lib/util/design-system/index.js';
  import { createOrGetDragState } from './drag-state.svelte.js';
  import { PreviewController } from './PreviewController.js';
  import { generateLocalId } from '$lib/util/unique';
  import { onDestroy } from 'svelte';
  import {
    IDLE,
    DRAGGING,
    DRAG_PREVIEW,
    DROPPING,
    DRAG_DISABLED
  } from '$lib/constants/state-labels/drag-states.js';

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
   *   previewSnippet?: import('svelte').Snippet<[{
   *     element: HTMLElement,
   *     rect: DOMRect
   *   }]>,
   *   contextKey?: import('$lib/typedef').ContextKey,
   *   isDragging?: boolean,
   *   isDropping?: boolean,
   *   isDragPreview?: boolean,
   *   onDragStart?: (detail: {
   *     event: DragEvent,
   *     item: any,
   *     source: string,
   *     group: string,
   *     getPreviewController: () => PreviewController
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
    previewSnippet,
    contextKey,
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

  const dragState = createOrGetDragState(contextKey);

  const draggableId = generateLocalId();
  let draggableElement;
  let dragTimeout = null;
  let currentState = $state(IDLE);

  // Custom preview follower state
  let showPreview = $state(false);
  let previewX = $state(0);
  let previewY = $state(0);
  let dragOffsetX = $state(0);
  let dragOffsetY = $state(0);
  let customPreviewSet = $state(false);
  let elementRect = $state(null);

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

  // Clean up on component destroy
  onDestroy(() => {
    if (showPreview) {
      document.removeEventListener('dragover', handleDocumentDragOver);
    }
  });

  /**
   * Handle document level dragover to ensure we get position updates
   * @param {DragEvent} event
   */
  function handleDocumentDragOver(event) {
    if (showPreview && currentState === DRAGGING) {
      // Update position for the custom preview
      previewX = event.clientX - dragOffsetX;
      previewY = event.clientY - dragOffsetY;

      // Prevent default to allow drop
      event.preventDefault();
    }
  }

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

    // Set shared drag state
    dragState.start(draggableId, dragData);

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));

    // Create the preview controller with natural offsets already calculated
    const previewController = new PreviewController(event);

    // Function to get the preview controller
    const getPreviewController = () => previewController;

    // Call onDragStart with the getPreviewController function
    onDragStart?.({ event, item, source, group, getPreviewController });

    // Check if we have a preview snippet and no custom preview was set by preview controller
    if (previewSnippet && !previewController.hasCustomPreview()) {
      try {
        // Get the element's bounding rectangle
        const rect = draggableElement.getBoundingClientRect();
        elementRect = rect;

        // Calculate offsets - this is the natural position where the user grabbed
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;

        // Set initial position
        previewX = event.clientX - dragOffsetX;
        previewY = event.clientY - dragOffsetY;

        // Set a transparent 1x1 pixel image as drag preview to hide browser preview
        const emptyImg = new Image();
        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        event.dataTransfer.setDragImage(emptyImg, 0, 0);

        // Add document level event listener to catch all dragover events
        document.addEventListener('dragover', handleDocumentDragOver);

        // Show our custom preview
        showPreview = true;
        customPreviewSet = true;
      } catch (err) {
        console.error('Error setting up custom preview:', err);
        // Fallback to default preview
        previewController.applyDefaultPreview();
      }
    }
    // Apply default preview if no custom preview was set and no snippet
    else if (!previewController.hasCustomPreview() && !customPreviewSet) {
      previewController.applyDefaultPreview();
    }
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
    dragState.end(draggableId);

    // Clean up document event listener
    if (customPreviewSet) {
      document.removeEventListener('dragover', handleDocumentDragOver);
      showPreview = false;
      customPreviewSet = false;
      elementRect = null;
    }

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
  data-id={draggableId}
  bind:this={draggableElement}
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

{#if previewSnippet && showPreview && elementRect}
  <div
    data-companion="drag-preview-follower"
    style="position: fixed; z-index: 9999; pointer-events: none;"
    style:left="{previewX}px"
    style:top="{previewY}px"
  >
    {@render previewSnippet({ element: draggableElement, rect: elementRect })}
  </div>
{/if}
