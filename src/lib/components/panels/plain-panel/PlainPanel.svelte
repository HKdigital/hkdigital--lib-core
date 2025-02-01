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
   *   width?: string,
   *   classes?: string
   *   children?: import('svelte').Snippet,
   * } & { [attr: string]: * }}
   */
  const {
    // Style
    base,
    bg,
    width,
    classes,

    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<div data-panel="plain-panel" class="{base} {bg} {width} {classes}" {...attrs}>
  {@render children()}
</div>
