<script>
  import { onMount, onDestroy } from 'svelte';
  import { toStateClasses } from '$lib/util/design-system/index.js';
  import { useDragState } from './drag-state.svelte.js';

  import {
    READY,
    DRAG_OVER,
    CAN_DROP,
    CANNOT_DROP,
    DROP_DISABLED,
    ACTIVE_DROP
  } from '$lib/constants/state-labels/drop-states.js';

  const dragState = useDragState();

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

  let currentState = $state(READY);
  let dragCounter = 0;

  // Cleanup function
  let cleanup;

  onMount(() => {
    // Global dragend listener to ensure state cleanup
    const handleGlobalDragEnd = () => {
      dragCounter = 0;
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
   * @param {Object} data
   * @returns {boolean}
   */
  function canAcceptDrop(data) {
    if (disabled) return false;
    if (!data) return false;
    if (data.group !== group) return false;
    if (!accepts(data.item)) return false;
    if (itemCount >= maxItems) return false;
    return true;
  }

  /**
   * Handle drag enter
   * @param {DragEvent} event
   */
  function handleDragEnter(event) {
    event.preventDefault();
    dragCounter++;

    if (dragCounter === 1) {
      const dragData = dragState.current;

      if (dragData) {
        currentState = canAcceptDrop(dragData)
          ? CAN_DROP
          : CANNOT_DROP;
      } else {
        currentState = DRAG_OVER;
      }

      onDragEnter?.({ event, zone, canDrop: currentState === CAN_DROP });
    }
  }

  /**
   * Handle drag over
   * @param {DragEvent} event
   */
  function handleDragOver(event) {
    event.preventDefault();

    // Re-evaluate on each dragover in case state changed
    const dragData = dragState.current;

    if (dragData && currentState === DRAG_OVER) {
      currentState = canAcceptDrop(dragData)
        ? CAN_DROP
        : CANNOT_DROP;
    }

    if (currentState === CAN_DROP) {
      event.dataTransfer.dropEffect = 'move';
    } else if (currentState === CANNOT_DROP) {
      event.dataTransfer.dropEffect = 'none';
    }

    onDragOver?.({ event, zone });
  }

  /**
   * Handle drag leave
   * @param {DragEvent} event
   */
  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      dragCounter--;

      if (dragCounter <= 0) {
        dragCounter = 0;
        currentState = READY;
        onDragLeave?.({ event, zone });
      }
    }
  }

  /**
   * Handle drop
   * @param {DragEvent} event
   */
  function handleDrop(event) {
    event.preventDefault();
    dragCounter = 0;

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));

      if (canAcceptDrop(data)) {
        currentState = ACTIVE_DROP;
        onDropStart?.({ event, zone, data });

        const dropResult = onDrop?.({
          event,
          zone,
          item: data.item,
          source: data.source,
          metadata: data.metadata
        });

        Promise.resolve(dropResult).then(() => {
          currentState = READY;
          onDropEnd?.({ event, zone, data, success: true });
        }).catch((error) => {
          currentState = READY;
          onDropEnd?.({ event, zone, data, success: false, error });
        });
      } else {
        currentState = READY;
      }
    } catch (error) {
      console.error('Drop error:', error);
      currentState = READY;
    }
  }
</script>

<div
  data-component="dropzone"
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
