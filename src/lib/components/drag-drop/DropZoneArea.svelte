<script>
  import { DropZone } from '$lib/components/drag-drop/index.js';

  /**
   * @type {{
   *   zone?: string,
   *   group?: string,
   *   disabled?: boolean,
   *   accepts?: (item: any) => boolean,
   *   fillContainer?: boolean,
   *   aspectRatio?: string,
   *   overflow?: 'auto' | 'hidden' | 'visible' | 'scroll',
   *   base?: string,
   *   classes?: string,
   *   children?: import('svelte').Snippet,
   *   contextKey?: import('$lib/typedef').ContextKey,
   *   dropPreviewSnippet?: import('svelte').Snippet<[import('$lib/typedef').DragData]>,
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
   *   onDrop?: (detail: import('$lib/typedef').DropData) => any | Promise<any>,
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
    fillContainer = true,
    aspectRatio = '',
    overflow = 'hidden',
    base = '',
    classes = '',
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

  // Build overflow classes based on prop
  let overflowClasses = $derived.by(() => {
    switch (overflow) {
      case 'auto':
        return 'overflow-auto';
      case 'scroll':
        return 'overflow-scroll';
      case 'visible':
        return 'overflow-visible';
      case 'hidden':
      default:
        return 'overflow-hidden';
    }
  });

  // Combine all classes for the drop zone
  let combinedClasses = $derived(
    `${overflowClasses} ${aspectRatio} ${classes}`.trim()
  );
</script>

<DropZone
  data-component="drop-zone"
  data-type="area"
  {zone}
  {group}
  {disabled}
  {accepts}
  heightMode={fillContainer ? 'fill' : 'fixed'}
  {base}
  classes={combinedClasses}
  {contextKey}
  {dropPreviewSnippet}
  bind:isDragOver
  bind:canDrop
  {onDragEnter}
  {onDragOver}
  {onDragLeave}
  {onDrop}
  {onDropStart}
  {onDropEnd}
  {...attrs}
>
  {#if children}
    {@render children()}
  {/if}
</DropZone>
