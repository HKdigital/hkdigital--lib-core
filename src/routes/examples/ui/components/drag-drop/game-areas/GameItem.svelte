<script>
    import { ZONE_ONE } from './constants/zones.js';

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

<div data-component>
  {#if !dragPreview && data.currentZone==ZONE_ONE}
    <div data-section="heading">
      {data.currentZone}
    </div>
  {/if}

  <div data-section="body" {...attrs}
      style:background-color={data.bg}>
    GameItem
  </div>
</div>

<style>
  [data-component] {
    /*touch-action: none;*/
    cursor: grab;
  }

  [data-section="heading"] {
    width: 100px;
    background-color: black;
    color: white;
    padding: 4px;
  }

  [data-section="body"] {
    width: 100px;
    height: 100px;
    /*pointer-events: auto;*/
    color: #ddd;
    border: solid 1px black;
    padding: 8px;
  }
</style>
