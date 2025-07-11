<script>
  import { toStateClasses } from '$lib/util/design-system/index.js';
  import { createOrGetDragState } from './drag-state.svelte.js';
  import { GridLayers } from '$lib/components/layout';
  import { generateLocalId } from '$lib/util/unique';
  import {
    READY,
    DRAG_OVER,
    CAN_DROP,
    CANNOT_DROP
  } from '$lib/constants/states/drop.js';

  /** @typedef {import('$lib/typedef').DragData} DragData */
  /** @typedef {import('$lib/typedef').DropData} DropData */

  /**
   * @type {{
   *   zone?: string,
   *   group?: string,
   *   disabled?: boolean,
   *   accepts?: (dragData: any, target: { zone:string, group: string }) => boolean,
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

  const dragState = createOrGetDragState(contextKey);
  const dropZoneId = generateLocalId();

  let currentState = $state(READY);
  let dropZoneElement = $state(null);

  // Computed height classes based on mode
  let heightClasses = $derived.by(() => {
    const classes = [];

    switch (heightMode) {
      case 'flexible':
        if (minHeight) classes.push(minHeight);
        else classes.push('min-h-[100px]');
        if (maxHeight) {
          classes.push(maxHeight);
          classes.push('overflow-y-auto');
        }
        break;
      case 'fill':
        classes.push('h-full');
        break;
      case 'fixed':
      default:
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

  // Register/unregister with drag state
  $effect(() => {
    if (dropZoneElement) {
      // Register this dropzone
      dragState.registerDropZone(dropZoneId, {
        zone,
        group,
        accepts: (dragData) => {
          if (disabled) return false;
          if (!dragData) return false;

          return accepts(dragData, { zone, group });
        },
        onDragEnter: (detail) => {
          currentState = detail.canDrop ? CAN_DROP : CANNOT_DROP;
          onDragEnter?.(detail);
        },
        onDragOver: (detail) => {
          onDragOver?.(detail);
        },
        onDragLeave: (detail) => {
          currentState = READY;
          onDragLeave?.(detail);
        },
        onDrop: async (dropData) => {
          currentState = READY;

          try {
            onDropStart?.({
              event: dropData.drop.event,
              zone: dropData.zone,
              data: dropData.drag
            });

            const result = await onDrop?.(dropData);

            onDropEnd?.({
              event: dropData.drop.event,
              zone: dropData.zone,
              data: dropData.drag,
              success: true
            });

            return result;
          } catch (error) {
            onDropEnd?.({
              event: dropData.drop.event,
              zone: dropData.zone,
              data: dropData.drag,
              success: false,
              error
            });
            throw error;
          }
        },
        element: dropZoneElement
      });

      // Cleanup on unmount
      return () => {
        dragState.unregisterDropZone(dropZoneId);
      };
    }
  });

  // Monitor drag state to update preview
  let showPreview = $derived(
    dragState.activeDropZone === dropZoneId &&
      currentState === CAN_DROP &&
      dropPreviewSnippet
  );
</script>

<div
  data-component="drop-zone"
  bind:this={dropZoneElement}
  class="{base} {heightClasses} {classes} {stateClasses}"
  data-zone={zone}
  {...attrs}
>
  <GridLayers heightFrom={heightMode === 'flexible' ? 'content' : null}>
    {#if children}
      <!-- <div
        data-layer="content"
        class:relative={heightMode === 'flexible'}
        class:w-full={heightMode === 'flexible'}
      > -->
      {@render children()}
      <!-- </div> -->
    {/if}

    {#if showPreview && dropPreviewSnippet}
      <div data-layer="preview">
        {@render dropPreviewSnippet(dragState.current)}
      </div>
    {/if}
  </GridLayers>
</div>

<style>
  [data-component='drop-zone'] {
    -webkit-tap-highlight-color: transparent;
  }

  /*  [data-layer='content']:not(.relative) {
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
*/
  [data-layer='preview'] {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }
</style>
