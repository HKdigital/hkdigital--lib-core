<script>
  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   role?: 'primary' | 'secondary',
   *   children: import('svelte').Snippet,
   *   [key: string]: any
   * }}
   */
  const {
    // Style
    base,
    bg,
    classes,

    role = 'primary',

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<button
  data-component="button"
  data-type="default"
  data-role={role}
  data-variant="default"
  type="button"
  class="{base} {bg} {classes}"
  {...attrs}
>
  {@render children()}
</button>
