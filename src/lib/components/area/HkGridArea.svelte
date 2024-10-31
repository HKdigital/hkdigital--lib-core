<script>
  /**
   * Grid area component
   * This component contains a DIV that has display: grid set. It is
   * wrapped in a box which makes it possible to add box attributes
   * such as margins.
   *
   * Following component guidelines from Skeleton
   * @see https://next.skeleton.dev/docs/resources/contribute/components
   */

  import HkArea from './HkArea.svelte';

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   padding?: string,
   *   margin?: string,
   *   classes?: string,
   *   style?: string,
   *   boxBase?: string,
   *   boxBg?: string,
   *   boxPadding?: string,
   *   boxMargin?: string,
   *   boxClasses?: string,
   *   boxAttrs?: { [attr: string]: * },
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
    boxBase,
    boxBg,
    boxPadding,
    boxMargin,
    boxClasses,
    boxAttrs,

    // Snippets
    children,

    // DOM Element's
    domElem = $bindable(),
    boxDomElem = $bindable(),

    // Attributes
    ...attrs
  } = $props();
</script>

<div
  data-hk-grid-area-box
  class="{boxBase} {boxBg} {boxPadding} {boxMargin} {boxClasses}"
  {...boxAttrs}
  bind:this={boxDomElem}
>
  <HkArea
    data-hk-grid-area
    base="grid {base}"
    bind:domElem
    {bg}
    {padding}
    {margin}
    {classes}
    {style}
    {...attrs}
  >
    {@render children()}
  </HkArea>
</div>
