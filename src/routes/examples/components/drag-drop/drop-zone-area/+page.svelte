<script>
  import {
    Draggable,
    DropZoneArea,
    createDragState
  } from '$lib/components/drag-drop';

  import { GridLayers } from '$lib/components/layout/index.js';
  import Recyclable from './Recyclable.js';

  /** @typedef {import('$lib/typedef').DropData} DropData */

  // Create a shared drag state context
  const dragContextKey = Symbol('recycling');
  createDragState(dragContextKey);

  // Color mapping for item types
  const typeBorders = {
    plastic: 'border-warning-500',
    paper: 'border-secondary-500',
    glass: 'border-tertiary-500',
    waste: 'border-surface-500',
    organic: 'border-primary-500'
  };

  // Icons for each item type
  const typeIcons = {
    plastic: '♳',
    paper: '📄',
    glass: '🍶',
    waste: '🗑️',
    organic: '🌱'
  };

  // Fixed item size
  const itemSize = 60;

  // Recyclable items - now using Recyclable class instances
  let items = $state([
    new Recyclable({ id: 1, type: 'plastic', icon: '🥤' }),
    new Recyclable({ id: 2, type: 'paper', icon: '📰' }),
    new Recyclable({ id: 3, type: 'glass', icon: '🫙' }),
    new Recyclable({ id: 4, type: 'waste', icon: '🍬' }),
    new Recyclable({ id: 5, type: 'plastic', icon: '🥛' }),
    new Recyclable({ id: 6, type: 'paper', icon: '📦' }),
    new Recyclable({ id: 7, type: 'glass', icon: '🍾' }),
    new Recyclable({ id: 8, type: 'organic', icon: '🍌' })
  ]);

  // Define recycling bins
  let recyclingBins = $state([
    {
      id: 1,
      type: 'plastic',
      x: 20,
      y: 20,
      width: 200,
      height: 200,
      color: 'bg-warning-100',
      icon: '♳'
    },
    {
      id: 2,
      type: 'paper',
      x: 240,
      y: 20,
      width: 200,
      height: 200,
      color: 'bg-secondary-100',
      icon: '📄'
    },
    {
      id: 3,
      type: 'glass',
      x: 460,
      y: 20,
      width: 200,
      height: 200,
      color: 'bg-tertiary-100',
      icon: '🍶'
    },
    {
      id: 4,
      type: 'waste',
      x: 680,
      y: 20,
      width: 200,
      height: 200,
      color: 'bg-surface-100',
      icon: '🗑️'
    },
    {
      id: 5,
      type: 'organic',
      x: 900,
      y: 20,
      width: 200,
      height: 200,
      color: 'bg-primary-100',
      icon: '🌱'
    }
  ]);

  // Track dropped items with their positions
  let droppedItems = $state([]);

  // State tracking
  let binStates = $state(recyclingBins.map(() => false));

  /**
   * Handle dropping an item into a bin
   * @param {DropData} dropData - The drop data containing item and position
   * @param {Object} bin - The bin receiving the drop
   */
  function handleBinDrop({ x, y, item, drag, drop }, bin) {
    console.debug({ x, y, canRecycle: item.canRecycle() });

    // Add to dropped items
    droppedItems = [
      ...droppedItems,
      {
        ...item,
        x,
        y,
        binId: bin.id
      }
    ];

    // Remove from original items
    items = items.filter((i) => i.id !== item.id);
  }

  /**
   * Get items dropped in a specific bin
   * @param {number} binId - The bin identifier
   * @returns {Array} Items in the bin
   */
  function getItemsInBin(binId) {
    return droppedItems.filter((item) => item.binId === binId);
  }
</script>

<div class="p-4 mx-auto" style:max-width="1200px">
  <h1 class="text-xl mb-4">recycling sorter</h1>

  <!-- recycling bins area -->
  <div
    class="relative border border-surface-500 bg-surface-50 p-2 mb-4"
    style:height="280px"
  >
    <GridLayers>
      {#each recyclingBins as bin, index}
        <div data-layer>
          <div
            class="absolute"
            style:margin-top="calc({bin.y}px * var(--scale-ui))"
            style:margin-left="calc({bin.x}px * var(--scale-ui))"
            style:height="calc({bin.height}px * var(--scale-ui))"
            style:width="calc({bin.width}px * var(--scale-ui))"
          >
            <DropZoneArea
              contextKey={dragContextKey}
              height="h-full"
              zone={`bin-${bin.id}`}
              accepts={({item}) => item.type === bin.type}
              bind:canDrop={binStates[index]}
              onDrop={(data) => handleBinDrop(data, bin)}
              base={`w-full h-full border-2 ${bin.color} border-dashed relative`}
              classes={`${typeBorders[bin.type]}`}
            >
              <!-- bin area with icon -->
              <div data-layer="icon"
                class="justify-self-center opacity-30 pt-20up">
                <span class="text-6xl">{bin.icon}</span>
              </div>

              {#each getItemsInBin(bin.id) as item (item.id)}
                <div
                  class="absolute border-8 bg-white flex items-center justify-center pointer-events-none"
                  class:border-warning-500={item.type === 'plastic'}
                  class:border-secondary-500={item.type === 'paper'}
                  class:border-tertiary-500={item.type === 'glass'}
                  class:border-surface-500={item.type === 'waste'}
                  class:border-primary-500={item.type === 'organic'}
                  style:left="{item.x}px"
                  style:top="{item.y}px"
                  style:width="{itemSize}px"
                  style:height="{itemSize}px"
                >
                  <span class="text-2xl">{item.icon}</span>
                </div>
              {/each}
            </DropZoneArea>
          </div>
        </div>
      {/each}
    </GridLayers>
  </div>

  <!-- items to sort -->
  <div class="border border-surface-500 bg-surface-100 p-4">
    <h2 class="text-lg mb-3">items to sort</h2>

    <div class="flex flex-wrap gap-3">
      {#each items as item (item.id)}
        <Draggable
          contextKey={dragContextKey}
          {item}
          source="items"
          base="cursor-grab active:cursor-grabbing border-8"
          classes={typeBorders[item.type]}
        >
          <div
            class="flex items-center justify-center"
            style:width="{itemSize}px"
            style:height="{itemSize}px"
          >
            <span class="text-2xl">{item.icon}</span>
          </div>

          {#snippet draggingSnippet()}
            <div
              class="border-8 flex items-center justify-center bg-white"
              class:border-warning-500={item.type === 'plastic'}
              class:border-secondary-500={item.type === 'paper'}
              class:border-tertiary-500={item.type === 'glass'}
              class:border-surface-500={item.type === 'waste'}
              class:border-primary-500={item.type === 'organic'}
              style:width="{itemSize}px"
              style:height="{itemSize}px"
            >
              <span class="text-2xl">{item.icon}</span>
            </div>
          {/snippet}
        </Draggable>
      {/each}

      {#if items.length === 0}
        <div class="w-full p-4 text-center text-surface-600 bg-surface-200">
          all items have been sorted!
          <button
            class="ml-2 px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 text-sm"
            onclick={() => window.location.reload()}
          >
            start over
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  [data-layer] {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
</style>
