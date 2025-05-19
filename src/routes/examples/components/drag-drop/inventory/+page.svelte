<script>
  import { Draggable, DropZone, createDragState } from '$lib/components/drag-drop';
  import { GridLayers } from '$lib/components/layout/index.js';

  /**
   * @typedef {Object} InventoryItem
   * @property {number} id - Unique identifier
   * @property {string} name - Display name
   * @property {string} type - Item type (weapon, potion, etc.)
   * @property {string} rarity - Item rarity (common, rare, epic, etc.)
   */

  /**
   * @typedef {Object} GameDropTarget
   * @property {number} id - Unique identifier
   * @property {string} name - DropTarget name/label
   * @property {number} x - X coordinate (0-100)
   * @property {number} y - Y coordinate (0-100)
   * @property {number} width - Width in pixels
   * @property {number} height - Height in pixels
   * @property {string[]} acceptTypes - Item types this dropTarget accepts
   * @property {string} [description] - Optional description
   */

  const dragContextKey = Symbol('game');

  createDragState(dragContextKey);

  // Player's inventory items
  let inventoryItems = $state([
    { id: 1, name: 'Health Potion', type: 'potion', rarity: 'common' },
    { id: 2, name: 'Magic Sword', type: 'weapon', rarity: 'rare' },
    { id: 3, name: 'Shield', type: 'armor', rarity: 'common' },
    { id: 4, name: 'Mystic Wand', type: 'weapon', rarity: 'epic' },
    { id: 5, name: 'Invisibility Cloak', type: 'accessory', rarity: 'epic' },
    { id: 6, name: 'Strength Elixir', type: 'potion', rarity: 'rare' }
  ]);

  let dropTargets = $state([
    {
      id: 1,
      name: 'Weapon Slot',
      x: 10,
      y: 10,
      width: 120,
      height: 150,
      acceptTypes: ['weapon']
    },
    {
      id: 2,
      name: 'Shield Slot',
      x: 400,
      y: 10,
      width: 120,
      height: 150,
      acceptTypes: ['armor']
    },
    {
      id: 3,
      name: 'Potion Belt',
      x: 10,
      y: 200,
      width: 120,
      height: 150,
      acceptTypes: ['potion']
    },
    {
      id: 4,
      name: 'Accessory Slot',
      x: 200,
      y: 10,
      width: 120,
      height: 150,
      acceptTypes: ['accessory', 'potion']
    },
    {
      id: 5,
      name: 'Magic Focus',
      x: 200,
      y: 200,
      width: 120,
      height: 150,
      acceptTypes: ['weapon', 'accessory']
    }
  ]);

  // Track items placed in each game dropTarget
  let placedItems = $state(Array(dropTargets.length).fill(null));

  // State tracking
  let isDraggingItem = $state(false);
  let currentDragItem = $state(null);
  let dropTargetStates = $state(dropTargets.map(() => false));

  /**
   * Handle dropping an item into a game dropTarget
   * @param {{ event: DragEvent, zone: string, item: any }} param0 - Drop event
   *        details
   * @param {number} dropTargetIndex - Index of the dropTarget in dropTargets
   *        array
   */
  function handleGameDropTargetDrop({ item }, dropTargetIndex) {
    console.log(`Dropping ${item.name} to ${dropTargets[dropTargetIndex].name}`);

    // Remove from inventory
    inventoryItems = inventoryItems.filter((i) => i.id !== item.id);

    // If there was an item already in this dropTarget, return it to inventory
    if (placedItems[dropTargetIndex]) {
      inventoryItems = [...inventoryItems, placedItems[dropTargetIndex]];
    }

    // Update the placed items array
    placedItems = placedItems.map((current, index) =>
      index === dropTargetIndex ? item : current
    );
  }

  /**
   * Handle returning an item to inventory from a game dropTarget
   * @param {number} dropTargetIndex - Index of the dropTarget in dropTargets
   *        array
   */
  function returnToInventory(dropTargetIndex) {
    if (placedItems[dropTargetIndex]) {
      // Add the item back to inventory
      inventoryItems = [...inventoryItems, placedItems[dropTargetIndex]];

      // Remove from dropTarget
      placedItems = placedItems.map((current, index) =>
        index === dropTargetIndex ? null : current
      );
    }
  }

  /**
   * Determine if a dropTarget can accept the current item
   * @param {InventoryItem} item - The item being dragged
   * @param {GameDropTarget} dropTarget - The target dropTarget
   * @returns {boolean} Whether the dropTarget accepts this item
   */
  function dropTargetAcceptsItem(item, dropTarget) {
    // Check if dropTarget accepts this item type
    return dropTarget.acceptTypes.includes(item.type);
  }
</script>

<div class="outer-box p-4 mx-auto">

  <div class="grid grid-cols-2 gap-8">
    <!-- Inventory Area -->

    <div data-section="inventory" class="border border-surface-500 bg-surface-100">
      <h2 class="h3 p-2 bg-surface-200">Inventory</h2>

      <div class="p-4 grid grid-cols-2 gap-2">
        {#each inventoryItems as item (item.id)}
          <Draggable
            contextKey={dragContextKey}
            {item}
            source="inventory"
            onDragStart={({ item }) => {
              console.log('Started dragging:', item.name);
            }}
            base="cursor-grab active:cursor-grabbing"
          >
            <div class="p-2 shadow border border-surface-300
                        bg-surface-50 hover:bg-surface-200 transition-colors
                        rarity-{item.rarity}">
              <div class="font-medium">{item.name}</div>
              <div class="flex justify-between text-xs mt-1">
                <span class="bg-primary-100 px-1">{item.type}</span>
                <span class="bg-secondary-100 px-1">{item.rarity}</span>
              </div>
            </div>
          </Draggable>
        {/each}

        {#if inventoryItems.length === 0}
          <div class="col-span-2 p-4 text-center text-surface-600 italic">
            Your inventory is empty. Return items from equipment slots.
          </div>
        {/if}
      </div>
    </div>

    <!-- Game Board Area -->
    <div data-section="game-board"
    class="relative h-[500px] border border-surface-500 bg-surface-100">
      <h2 class="h3 p-2 bg-surface-200">Game board</h2>

      <GridLayers>

      {#each dropTargets as dropTarget, index}
        <div data-layer>
          <div
            class="absolute"
            style:margin-top="calc({dropTarget.y}px * var(--scale-ui))"
            style:margin-left="calc({dropTarget.x}px * var(--scale-ui))"
            style:height="calc({dropTarget.height}px * var(--scale-ui))"
            style:width="calc({dropTarget.width}px * var(--scale-ui))">

            <DropZone
              contextKey={dragContextKey}
              zone={`dropTarget-${dropTarget.id}`}
              accepts={(item) => dropTargetAcceptsItem(item, dropTarget)}
              maxItems={1}
              bind:canDrop={dropTargetStates[index]}
              onDrop={(data) => handleGameDropTargetDrop(data, index)}
              base="w-full h-full bg-surface-200 p-2 shadow-md transition-all"
            >
              <div class="text-center text-sm font-bold mb-1">{dropTarget.name}</div>

              {#if placedItems[index]}
                <div class="flex flex-col items-center">
                  <div class="text-sm p-1 mb-1 w-full text-center
                              rarity-{placedItems[index].rarity}">
                    {placedItems[index].name}
                  </div>
                  <button
                    class="btn btn-sm variant-soft-error"
                    onclick={() => returnToInventory(index)}
                  >
                    Remove
                  </button>
                </div>
              {:else}
                <div class="text-xs text-center text-surface-700">
                  {dropTarget.description}
                </div>
              {/if}

              {#snippet empty()}
                <div class="text-center text-sm text-surface-600 italic">
                  {dropTarget.description}
                </div>
              {/snippet}

              {#snippet preview(data)}
                <div class={`preview p-1 text-center
                            ${dropTargetStates[index] ? 'bg-success-100' : 'bg-error-100'}`}>
                  {#if dropTargetStates[index]}
                    ✓ Place {data?.item?.name}
                  {:else}
                    ❌ Cannot equip here
                  {/if}
                </div>
              {/snippet}
            </DropZone>
          </div>
        </div>
      {/each}
      </GridLayers>
    </div>
  </div>
</div>

<style>
  .outer-box {
    width: 1200px * calc(var(--scale-ui));
  }

  [data-section="inventory"] {
    width: 600px * calc(var(--scale-ui));
  }

  [data-section="game-board"] {
    width: 600px * calc(var(--scale-ui));
  }

  [data-layer] {
    /* @apply absolute inset-0;*/
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
  }

  /* Rarity styles */
  .rarity-common {
    background-color: rgb(229, 231, 235);
    border-color: rgb(156, 163, 175);
  }

  .rarity-rare {
    background-color: rgb(219, 234, 254);
    border-color: rgb(59, 130, 246);
    color: rgb(30, 64, 175);
  }

  .rarity-epic {
    background-color: rgb(237, 233, 254);
    border-color: rgb(139, 92, 246);
    color: rgb(76, 29, 149);
  }

  /* Preview styles */
  .preview {
    padding: 0.5rem;
    text-align: center;
    font-style: italic;
  }
</style>
