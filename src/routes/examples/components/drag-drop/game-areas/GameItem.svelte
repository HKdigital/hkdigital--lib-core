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

<div {...attrs} style:background-color={data.bg}>
  GameItem
</div>

<style>
  div {
    width: 100px;
    height: 100px;
    pointer-events: auto;
    color: #ddd;
    border: solid 1px black;
    padding: 8px;
  }
</style>
