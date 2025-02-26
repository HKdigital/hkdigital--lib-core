<script>
  import { PanelGridRow } from '$lib/components/rows/index.js';

  /**
   * @example
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
   * } & { [attr: string]: any }}
   */
  const {
    // Style
    // base,
    // bg,
    // justify,
    // justifyItems,
    // flow = 'col',
    // gap,
    // classes,

    // // Snippets
    // children,

    // Attributes
    ...attrs
  } = $props();
</script>

<!-- class="test-small mb-8p mt-8 grid auto-cols-fr grid-flow-col justify-stretch gap-20p" -->

<PanelGridRow data-wrapper="panel-row-2" gap="gap-20p" {...attrs}
></PanelGridRow>
