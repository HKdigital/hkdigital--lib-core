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
    size = 'md',

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<button
  data-component="button"
  data-type="plain"
  data-role={role}
  data-size={size}
  data-variant="none"
  type="button"
  class="{base} {bg} {classes}"
  {...attrs}
>
  {@render children()}
</button>
