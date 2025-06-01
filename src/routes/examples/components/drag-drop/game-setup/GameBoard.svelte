<script>
  import {
    Draggable,
    DropZone
  } from '$lib/components/drag-drop/index.js';

  import { GridLayers } from '$lib/components/layout/index.js';

  import GameItem from './GameItem.svelte';

  /**
   * @type {{
   *   zone: any,
   *   gameItems: import('./GameModel.svelte.js').default[],
   *   enableDebug?: boolean
   * }}
   */
  let {
    zone,
    gameItems,
    enableDebug = true
  } = $props();

  let dropZoneElement;

  /**
   * Drop an on drop zone trailer-inside
   *
   * @param {object} dropData DropData
   */
  function onDrop(dropData) {
    console.debug(`dropped in zone [${zone}]`, dropData);

    // Get the current scale factor
    const dropZoneElement = dropData.drop.event.currentTarget;

    // console.debug(
    //   '--scale-viewport',
    //   getComputedStyle(dropZoneElement).getPropertyValue('--scale-viewport')
    // );

    const scaleViewportProp =
      getComputedStyle(dropZoneElement).getPropertyValue('--scale-viewport') ||
      '1';

    let scaleViewport = parseFloat(scaleViewportProp);

    if (Number.isNaN(scaleViewport)) {
      console.debug(
        `Could not get/parse [--scale-viewport=${scaleViewportProp}]`
      );
      scaleViewport = 1;
    }

    // Convert screen pixels to logical pixels
    const logicalX = dropData.x / scaleViewport;
    const logicalY = dropData.y / scaleViewport;

    const placement = { x: logicalX, y: logicalY };

    // const placement = { x: dropData.x, y: dropData.y };

    dropData.item.moveToZone({ zone, placement });
  }

  let dragIndex = $state(-1);
  let selectedIndex = $state(-1);

  let canDrop = $state(false);
</script>

<div data-feature="game-board">
  <DropZone
    data-layer="drop-zone"
    autoHeight={true}
    {zone}
    data-variant="debug"
    accepts={(item) => {
      // Accept all
      return true;
    }}
    bind:canDrop

    onDrop={(dropData) => {

      // const target = dropData.drop.event.currentTarget;

      // console.log('Element that received drop:', target.getAttribute('data-component'));
      // console.log('Element classes:', target.className);
      // console.log('DropZone boundaries:', target.getBoundingClientRect());
      // console.log('Drop coordinates:', dropData.drop.event.clientX, dropData.drop.event.clientY);

      onDrop(dropData);
    }}

  >
    <div style="height: 300px;">
      {#each gameItems as data, index}
        {#if data.isInZone(zone)}
          <div
            class="absolute"
            style:margin-left="calc({data.currentPlacement.x}px *
            var(--scale-viewport))"
            style:margin-top="calc({data.currentPlacement.y}px *
            var(--scale-viewport))"
            style:width="calc({data.boardPlacement.w}px * var(--scale-viewport))"
            style:height="calc({data.boardPlacement.h}px *
            var(--scale-viewport))"
          >
            <Draggable
              item={data}
              classes="w-full h-full"
              source="trailer-inside"
              onDragStart={async ({ item }) => {
                // console.log('Started dragging:', item);
                dragIndex = index;
              }}
              onDragEnd={({ item }) => {
                // console.log('Ended dragging:', item);
                dragIndex = -1;
              }}
            >
              <GameItem
                {data}
                inert={dragIndex === index}
                selected={selectedIndex === index}
                onclick={() => {
                  console.log('clicked!');
                  selectedIndex = index;
                }}
              />

              {#snippet draggingSnippet({ element, rect })}
                <GameItem {data} dragPreview={true} />
              {/snippet}
            </Draggable>

            {#if enableDebug}
              ({Math.round(data.currentPlacement.x)},{Math.round(
                data.currentPlacement.y
              )})
            {/if}

          </div>
        {/if}
      {/each}
    </div>
  </DropZone>

  {#if enableDebug}
    <div data-section="heading" class="pointer-events-none">
      <h5 class="type-heading-h5 p-8ht">zone: {zone}</h5>
    </div>
  {/if}
  <!-- </GridLayers> -->
</div>

<style>
  [data-feature="game-board"] {
    border: solid 10px green;
    padding-top: 100px;
    padding-bottom: 100px;
  }
</style>
