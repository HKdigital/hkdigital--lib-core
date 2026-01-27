<script>
  /**
   * GridLayers Component
   *
   * Creates a single-cell grid where all children occupy the same space,
   * enabling layered layouts with natural height behavior.
   *
   * @type {{
   *   class?: string,
   *   base?: string,  // Deprecated: use 'class' instead
   *   bg?: string,  // Deprecated: use 'class' instead
   *   padding?: string,
   *   margin?: string,
   *   classes?: string,  // Deprecated: use 'class' instead
   *   style?: string,
   *   overflow?: string,
   *   children: import('svelte').Snippet,
   *   [attr: string]: any
   * }}
   */
  const {
    // Container styles
    class: className,
    base,  // Deprecated: kept for backward compatibility
    bg,  // Deprecated: kept for backward compatibility
    padding = '',
    margin = '',
    classes,  // Deprecated: kept for backward compatibility
    style = '',
    overflow = '',

    // Content
    children,

    // Attributes
    ...attrs
  } = $props();

  // Build the inline style
  let containerStyle = $derived.by(() => {
    const styles = ['grid-template: 1fr / 1fr;'];

    if (style) {
      styles.push(style);
    }

    return styles.join(' ');
  });
</script>

<div
  data-component="grid-layers"
  class="grid {base ?? ''} {bg ?? ''} {className ?? classes ?? ''} {margin} {padding} {overflow}"
  style={containerStyle}
  {...attrs}
>
  {@render children()}
</div>

<style>
  /* All direct children occupy the same grid area */
  div > :global(*) {
    grid-area: 1 / 1;
    position: relative;
  }
</style>
