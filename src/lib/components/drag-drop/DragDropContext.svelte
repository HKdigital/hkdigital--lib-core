<script>
  import { createDragState } from './drag-state.svelte.js';

  /**
   * @type {{
   *   contextKey?: import('$lib/typedef').ContextKey,
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

  function onDragEnter( event ) {
    console.log('dragenter context', dragState.getDraggable(event));
  }

  function onDragOver( event ) {
    console.log('dragover context', dragState.getDraggable(event));
  }

  function onDragLeave( event ) {
    console.log('dragleave context', dragState.getDraggable(event));
  }

</script>

<div
  data-component="drag-drop-context"
  ondragenter={onDragEnter}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  class="{base} {classes}"
  {...attrs}
>
  {@render children()}
</div>

<style>
  div {
    position: absolute;
    top: 10px;
    left: 10px;
    height: 600px;
    width: 600px;
    border: solid 10px cyan;
  }
</style>
