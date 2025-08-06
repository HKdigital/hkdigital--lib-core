<script>
  import Button from '../button/Button.svelte';

  /**
   * @type {{
   *   children: import('svelte').Snippet,
   *   [key: string]: any
   * }}
   */
  const {
    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<Button type="text" data-type="text" {...attrs}>
  {@render children()}
</Button>
