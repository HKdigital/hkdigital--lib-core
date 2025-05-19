<script>
  import { Draggable, DropZone, createDragState } from '$lib/components/drag-drop';
  import { GridLayers } from '$lib/components/layout/index.js';

  /**
   * @typedef {Object} RecycleItem
   * @property {number} id - Unique identifier
   * @property {string} name - Display name
   * @property {string} type - Item type (plastic, paper, glass, waste)
   * @property {string} icon - Icon or emoji for the item
   * @property {string} description - Short item description
   */

  /**
   * @typedef {Object} BinTarget
   * @property {number} id - Unique identifier
   * @property {string} name - Bin name
   * @property {number} x - X coordinate
   * @property {number} y - Y coordinate
   * @property {number} width - Width in pixels
   * @property {number} height - Height in pixels
   * @property {string[]} acceptTypes - Item types this bin accepts
   * @property {string} color - Background color for this bin
   * @property {string} [description] - Optional description
   */

  const dragContextKey = Symbol('recycling');

  createDragState(dragContextKey);

  // Color mapping for item types
  const typeColors = {
    plastic: 'bg-warning-500',
    paper: 'bg-secondary-500',
    glass: 'bg-tertiary-500',
    waste: 'bg-surface-500',
    organic: 'bg-primary-500'
  };

  // Border colors for item types
  const typeBorders = {
    plastic: 'border-warning-500',
    paper: 'border-secondary-500',
    glass: 'border-tertiary-500',
    waste: 'border-surface-500',
    organic: 'border-primary-500'
  };

  // Text colors
  const typeText = {
    plastic: 'text-warning-500',
    paper: 'text-secondary-500',
    glass: 'text-tertiary-500',
    waste: 'text-surface-500',
    organic: 'text-primary-500'
  };

  // Icons for each item type
  const typeIcons = {
    plastic: '♳',
    paper: '📄',
    glass: '🍶',
    waste: '🗑️',
    organic: '🌱'
  };

  // Recyclable items
  let items = $state([
    {
      id: 1,
      name: 'Soda Bottle',
      type: 'plastic',
      icon: '🥤',
      description: 'Empty plastic bottle'
    },
    {
      id: 2,
      name: 'Newspaper',
      type: 'paper',
      icon: '📰',
      description: 'Old newspaper'
    },
    {
      id: 3,
      name: 'Glass Jar',
      type: 'glass',
      icon: '🫙',
      description: 'Empty glass jar'
    },
    {
      id: 4,
      name: 'Food Wrapper',
      type: 'waste',
      icon: '🍬',
      description: 'Candy wrapper'
    },
    {
      id: 5,
      name: 'Milk Jug',
      type: 'plastic',
      icon: '🥛',
      description: 'Plastic milk container'
    },
    {
      id: 6,
      name: 'Cardboard Box',
      type: 'paper',
      icon: '📦',
      description: 'Empty cardboard box'
    },
    {
      id: 7,
      name: 'Wine Bottle',
      type: 'glass',
      icon: '🍾',
      description: 'Empty glass bottle'
    },
    {
      id: 8,
      name: 'Banana Peel',
      type: 'organic',
      icon: '🍌',
      description: 'Compostable organic waste'
    }
  ]);

  let recyclingBins = $state([
    {
      id: 1,
      name: 'Plastic',
      x: 20,
      y: 20,
      width: 130,
      height: 200,
      acceptTypes: ['plastic'],
      color: 'bg-warning-300',
      description: 'For plastic items only'
    },
    {
      id: 2,
      name: 'Paper',
      x: 170,
      y: 20,
      width: 130,
      height: 200,
      acceptTypes: ['paper'],
      color: 'bg-secondary-300',
      description: 'For paper and cardboard'
    },
    {
      id: 3,
      name: 'Glass',
      x: 320,
      y: 20,
      width: 130,
      height: 200,
      acceptTypes: ['glass'],
      color: 'bg-tertiary-300',
      description: 'For glass containers'
    },
    {
      id: 4,
      name: 'Waste',
      x: 470,
      y: 20,
      width: 130,
      height: 200,
      acceptTypes: ['waste'],
      color: 'bg-surface-300',
      description: 'For non-recyclable waste'
    },
    {
      id: 5,
      name: 'Organic',
      x: 620,
      y: 20,
      width: 130,
      height: 200,
      acceptTypes: ['organic'],
      color: 'bg-primary-300',
      description: 'For compostable materials'
    }
  ]);

  // Track items placed in each bin
  let placedItems = $state(recyclingBins.map(() => []));

  // State tracking
  let isDraggingItem = $state(false);
  let currentDragItem = $state(null);
  let binStates = $state(recyclingBins.map(() => false));

  /**
   * Handle dropping an item into a recycling bin
   * @param {{ item: any }} param0 - Drop event details
   * @param {number} binIndex - Index of the bin
   */
  function handleBinDrop({ item }, binIndex) {
    console.log(`Dropping ${item.name} in ${recyclingBins[binIndex].name} bin`);

    // Remove from items list
    items = items.filter((i) => i.id !== item.id);

    // Add to the bin
    placedItems = placedItems.map((current, index) =>
      index === binIndex ? [...current, item] : current
    );
  }

  /**
   * Determine if a bin can accept the current item
   * @param {RecycleItem} item - The item being dragged
   * @param {BinTarget} bin - The target bin
   * @returns {boolean} Whether the bin accepts this item
   */
  function binAcceptsItem(item, bin) {
    return bin.acceptTypes.includes(item.type);
  }

  /**
   * Get CSS class for item
   * @param {RecycleItem} item - The item
   * @returns {string} CSS class string
   */
  function getItemClasses(item) {
    const typeColor = typeColors[item.type] || 'bg-surface-300';
    const typeBorder = typeBorders[item.type] || 'border-surface-500';
    return `${typeColor} ${typeBorder}`;
  }
</script>

<div class="p-4 mx-auto" style="max-width: 1200px;">
  <h1 class="text-2xl mb-4">Recycling Sorter</h1>

  <!-- Recycling Bins -->
  <div class="relative border border-surface-500 bg-surface-100 p-2 mb-4" style="height: 280px;">
    <GridLayers>
    {#each recyclingBins as bin, index}
      <div data-layer>
        <div
          class="absolute"
          style:margin-top="calc({bin.y}px * var(--scale-ui))"
          style:margin-left="calc({bin.x}px * var(--scale-ui))"
          style:height="calc({bin.height}px * var(--scale-ui))"
          style:width="calc({bin.width}px * var(--scale-ui))">

          <DropZone
            contextKey={dragContextKey}
            zone={`bin-${bin.id}`}
            accepts={(item) => binAcceptsItem(item, bin)}
            bind:canDrop={binStates[index]}
            onDrop={(data) => handleBinDrop(data, index)}
            base={`w-full h-full border border-surface-500 ${bin.color}`}
          >
            <div class="flex flex-col h-full">
              <div class="text-center p-1 border-b border-surface-500 font-medium">
                {bin.name}
              </div>

              <div class="flex-1 p-2 overflow-visible">
                {#if placedItems[index].length > 0}
                  <div class="space-y-2">
                    {#each placedItems[index] as item (item.id)}
                      <div class="flex items-center bg-surface-100 border p-1">
                        <span class="text-lg mr-1">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="h-full flex items-center justify-center text-center text-surface-600">
                    <div>
                      <div class="text-3xl mb-2">{typeIcons[bin.acceptTypes[0]]}</div>
                      <div class="text-sm">{bin.description}</div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>

            {#snippet preview(data)}
              <div class={`p-2 text-center border
                          ${binStates[index] ? 'bg-success-100 border-success-500' : 'bg-error-100 border-error-500'}`}>
                {#if binStates[index]}
                  Correct bin for {data?.item?.name}
                {:else}
                  Wrong bin - {data?.item?.name} is not {bin.name.toLowerCase()}
                {/if}
              </div>
            {/snippet}
          </DropZone>
        </div>
      </div>
    {/each}
    </GridLayers>
  </div>

  <!-- Items to Sort -->
  <div class="border border-surface-500 bg-surface-100 p-4">
    <h2 class="text-xl mb-3">Items to Sort</h2>

    <div class="grid grid-cols-4 gap-3">
      {#each items as item (item.id)}
        <Draggable
          contextKey={dragContextKey}
          {item}
          source="items"
          onDragStart={({ item }) => {
            console.log('Started dragging:', item.name);
            isDraggingItem = true;
            currentDragItem = item;
          }}
          onDragEnd={() => {
            isDraggingItem = false;
            currentDragItem = null;
          }}
          base="cursor-grab active:cursor-grabbing border"
          classes={getItemClasses(item)}
        >
          <div class="p-2">
            <div class="flex items-center">
              <span class="text-2xl mr-2">{item.icon}</span>
              <div>{item.name}</div>
            </div>
            <div class="text-sm mt-1">{item.description}</div>
          </div>

          {#snippet previewSnippet({ element, rect })}
            <div class="border p-2 bg-white"
                 class:border-warning-500={item.type === 'plastic'}
                 class:border-secondary-500={item.type === 'paper'}
                 class:border-tertiary-500={item.type === 'glass'}
                 class:border-surface-500={item.type === 'waste'}
                 style="width: {rect.width * 0.8}px">
              <div class="flex items-center">
                <span class="text-xl mr-1">{item.icon}</span>
                <div class="text-sm">{item.name}</div>
              </div>
            </div>
          {/snippet}
        </Draggable>
      {/each}

      {#if items.length === 0}
        <div class="col-span-4 p-4 text-center text-surface-600 bg-surface-200">
          All items have been sorted! Great job!
        </div>
      {/if}
    </div>
  </div>

  <div class="mt-4 p-2 bg-surface-200 text-sm">
    <p>Drag and drop items into the correct recycling bins. Each item belongs to a specific bin category.</p>
  </div>
</div>

<style>
  [data-layer] {
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
  }
</style>
