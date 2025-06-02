<script>
  import { DropZone } from '$lib/components/drag-drop/index.js';

  /**
   * @type {{
   *   zone?: string,
   *   group?: string,
   *   disabled?: boolean,
   *   accepts?: (item: any) => boolean,
   *   minHeight?: string,
   *   maxHeight?: string,
   *   gap?: string,
   *   direction?: 'vertical' | 'horizontal',
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
    minHeight = 'min-h-[200px]',
    maxHeight = '',
    gap = 'gap-2',
    direction = 'vertical',
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

  // Build flex layout classes based on direction
  let layoutClasses = $derived.by(() => {
    const layoutParts = ['flex'];

    if (direction === 'vertical') {
      layoutParts.push('flex-col');
    } else {
      layoutParts.push('flex-row', 'flex-wrap');
    }

    if (gap) {
      layoutParts.push(gap);
    }

    return layoutParts.join(' ');
  });

  // Combine all classes for the drop zone
  let combinedClasses = $derived(
    `${layoutClasses} ${classes}`.trim()
  );
</script>

<DropZone
  data-component="drop-zone"
  data-type="list"
  {zone}
  {group}
  {disabled}
  {accepts}
  {minHeight}
  {maxHeight}
  heightMode="flexible"
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
