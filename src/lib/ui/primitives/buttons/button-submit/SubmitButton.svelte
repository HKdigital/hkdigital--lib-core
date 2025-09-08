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

<Button buttonType="submit" type="text" {...attrs}>
  {@render children()}
</Button>
