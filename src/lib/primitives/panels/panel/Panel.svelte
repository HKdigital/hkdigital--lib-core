<script>
  /**
   * @example
   *
   *
   */

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   width?: 'sm' | 'md' | 'lg',
   *   variant?: string,
   *   children?: import('svelte').Snippet,
   * } & { [attr: string]: any }}
   */
  const {
    // Style
    base,
    bg,
    classes,

    width = 'md',
    variant = 'light',

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<div
  data-component="panel"
  data-width={width}
  data-variant={variant}
  class="{base} {bg} {classes}"
  {...attrs}
>
  {@render children()}
</div>
