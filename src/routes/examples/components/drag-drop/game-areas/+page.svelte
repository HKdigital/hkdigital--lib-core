<script>
  // import { GridLayers } from '$lib/components/layout/index.js';

  // import { ImageBox } from '$lib/features/index.js';

  // import {
  //   AudiRs6AvantEmptyBumper,
  //   AudiRs6AvantEmptyLights,
  //   AudiRs6AvantEmptyRadiator
  // } from '$lib/assets/autoschadeherstel/bg';

  import { DragDropContext } from '$lib/components/drag-drop/index.js';

  import GameBoard from './GameBoard.svelte';
  import GameModel from './GameModel.svelte.js';

  import { GAME_ITEMS } from './constants/game-items.js';

  import { ZONE_ONE, ZONE_TWO } from './constants/zones.js';

  /** @type {GameModel[]} */
  let gameItems = $state([]);

  function initGameItems() {
    for (let j = 0, n = GAME_ITEMS.length; j < n; j = j + 1) {
      const gameItem = new GameModel(GAME_ITEMS[j]);
      gameItems.push(gameItem);
    }
  }

  initGameItems();
</script>

<div data-page>
  <DragDropContext>
    <div data-section="main">
      <div data-section="one">
        <GameBoard zone={ZONE_ONE} {gameItems} />
      </div>
      <div data-section="two">
        <GameBoard zone={ZONE_TWO} {gameItems} />
      </div>
    </div>
  </DragDropContext>
</div>

<style src="./style.css"></style>
