<script>
  /**
   * @type {{ 
   *   children: import('svelte').Snippet,
   *   data: { 
   *     navigationData: Object, 
   *     scalingEnabled: boolean, 
   *     folders: Array 
   *   } 
   * }}
   */
  let { children, data } = $props();
</script>

{@render children()}