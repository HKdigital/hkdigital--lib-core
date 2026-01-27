<script>
  /**
   * @example
   *
   *
   */

  /**
   * @type {{
   *   class?: string,
   *   base?: string,  // Deprecated: use 'class' instead
   *   bg?: string,  // Deprecated: use 'class' instead
   *   classes?: string,  // Deprecated: use 'class' instead
   *   width?: 'sm' | 'md' | 'lg',
   *   variant?: string,
   *   children?: import('svelte').Snippet,
   * } & { [attr: string]: any }}
   */
  const {
    // Style
    class: className,
    base,  // Deprecated: kept for backward compatibility
    bg,  // Deprecated: kept for backward compatibility
    classes,  // Deprecated: kept for backward compatibility

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
  class="{base ?? ''} {bg ?? ''} {className ?? classes ?? ''}"
  {...attrs}
>
  {@render children()}
</div>
