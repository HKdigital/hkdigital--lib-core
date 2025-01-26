<script>
  /**
   * @example
   *
   */

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   justify?: 'start'|'center'|'end'|'between'|'around'|'evenly'|'stretch'|'normal',
   *   justifyItems?: 'start'|'center'|'end'|'stretch',
   *   gap?: string,
   *   classes?: string,
   *   children?: import('svelte').Snippet,
   * } & { [attr: string]: * }}
   */
  const {
    // Style
    base,
    bg,
    justify,
    justifyItems,
    flow = 'col',
    gap,
    classes,

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();

  let colsCls = $derived.by(() => {
    //
    // The CSS classes to apply for the desired column layout
    //
    let out = '';

    /* @note justify-end won't work with auto-cols-fr! */

    if (justifyItems && justify !== 'end') {
      out += 'auto-cols-fr';
    } else {
      out += 'auto-cols-auto';
    }

    if (flow) {
      out += ` grid-flow-${flow}`;
    }

    // TODO: CSS for a specific number of columns

    return out.replace(/\s{2,}/g, ' ').trim();
  });

  let justifyCls = $derived.by(() => {
    //
    // Determine justify classes
    //
    if (justify) {
      return `justify-${justify}`;
    }

    return '';
  });

  let justifyItemsCls = $derived.by(() => {
    //
    // Determine justify-items classes
    //
    if (justifyItems) {
      return `justify-items-${justifyItems}`;
    }

    return '';
  });
</script>

<div
  data-row="panel-grid-row"
  class="{base} {bg} {gap} {classes} grid {colsCls} {justifyCls} {justifyItemsCls}"
  {...attrs}
>
  {@render children()}
</div>

<style>
  /* This rule makes justify-items-start behave like
     justify-items-center and justify-items-end */
  /*[data-row='panel-grid-row'] {
    & > :global(*) {
      width: fit-content;
      height: fit-content;
    }
  }*/

  /*[data-row='panel-grid-row'] {
    & > :global(*) {
      min-width: 0;
    }
  }*/
</style>
