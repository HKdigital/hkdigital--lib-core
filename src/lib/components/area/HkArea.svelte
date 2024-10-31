<script>
  /**
   * Area component
   * An area is actually a DIV that can be styled and can contain content
   *
   * Following component guidelines from Skeleton
   * @see https://next.skeleton.dev/docs/resources/contribute/components
   */

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   padding?: string,
   *   margin?: string,
   *   classes?: string,
   *   style?: string,
   *   children: import('svelte').Snippet
   * } & { [attr: string]: * }}
   */
  let {
    // Style
    base,
    bg,
    padding,
    margin,
    classes,
    style,

    // Snippets
    children,

    // DOM Element
    domElem = $bindable(),

    // Attributes
    ...attrs
  } = $props();
</script>

<div
  data-hk-area
  class="{base} {bg} {padding} {margin} {classes}"
  bind:this={domElem}
  {style}
  {...attrs}
>
  {@render children()}
</div>
