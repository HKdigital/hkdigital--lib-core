<script>
  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   variant?: string,
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
    variant,
    classes,

    role = 'primary',

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<button
  data-button="plain-button"
  type="button"
  class="{base} {bg} {variant} {classes} role-{role}"
  {...attrs}
>
  <p class="p">{@render children()}</p>
</button>
