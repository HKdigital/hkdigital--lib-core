<script>
  /**
   * @type {{
   *   children: import('svelte').Snippet,
   *   data: {
   *     navigationData: Object,
   *     scalingEnabled: boolean,
   *     folders: Array<object>
   *   }
   * }}
   */
  let { children, data } = $props();
</script>

{@render children()}
