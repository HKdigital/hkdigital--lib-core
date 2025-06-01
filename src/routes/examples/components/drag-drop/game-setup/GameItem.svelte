<script>
  /**
   * @type {{
   *   data: import('./GameModel.svelte.js').default,
   *   onclick?: () => void,
   *   selected?: boolean,
   *   dragPreview?: boolean,
   *   [key: string]: any
   * }}
   */
  let {
    data,
    onclick,
    selected = false,
    dragPreview = false,
    inert = false,
    ...attrs
  } = $props();
</script>

<div {...attrs}>
  GameItem
</div>

<style>
  div {
    width: 100px;
    height: 100px;
    pointer-events: auto;
    background-color: red;
  }
</style>
