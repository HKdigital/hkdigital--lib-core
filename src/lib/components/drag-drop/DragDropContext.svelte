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
</script>

<div
  data-component="drag-drop-context"
  class="{base} {classes}"
  {...attrs}
>
  {@render children()}
</div>
