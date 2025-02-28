<script>
  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   style?: string,
   *   aspectOnLandscape? :number,
   *   aspectOnPortrait? :number,
   *   onLandscape?: import('svelte').Snippet,
   *   onPortrait?: import('svelte').Snippet
   * } & { [attr: string]: any }}
   */
  const {
    // > Style
    base,
    bg,
    classes,
    style,

    // > Functional
    aspectOnLandscape,
    aspectOnPortrait,

    // >Snippets
    snippetLandscape,
    snippetPortrait
  } = $props();

  // > Game width and height

  let windowWidth = $state();
  let windowHeight = $state();

  let gameWidth = $state();
  let gameHeight = $state();

  let isLandscape = $derived(gameWidth > gameHeight);

  $effect(() => {
    // Determine game width and height from
    // window dimensions and desired game aspect

    let gameAspect;

    if (windowWidth > windowHeight) {
      gameWidth = getGameWidthOnLandscape({
        windowWidth,
        windowHeight,
        aspectOnLandscape
      });

      gameAspect = aspectOnLandscape;
    } else {
      gameWidth = getGameWidthOnPortrait({
        windowWidth,
        windowHeight,
        aspectOnPortrait
      });

      gameAspect = aspectOnPortrait;
    }

    if (gameAspect) {
      gameHeight = gameWidth / gameAspect;
    } else {
      gameHeight = windowHeight;
    }
  });

  // $inspect({ windowWidth, windowHeight, gameWidth, gameHeight, isLandscape });

  // $effect(() => {
  //   console.log({
  //     windowWidth,
  //     windowHeight,
  //     gameWidth,
  //     gameHeight,
  //     isLandscape
  //   });
  // });
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameHeight}
  <!-- <div
    data-boxes="game-box"
    class="{base} {bg} {classes}"
    style="width: {gameWidth}px; height: {gameHeight}px;--game-width={gameWidth};--game-height={gameHeight}; {style}" -->

  <div
    data-boxes="game-box"
    class="{base} {bg} {classes}"
    style:width="{gameWidth}px"
    style:height="{gameHeight}px"
    style:--game-width={gameWidth}
    style:--game-height={gameHeight}
    {style}
  >
    {#if isLandscape}
      {@render snippetLandscape()}
    {:else}
      {@render snippetPortrait()}
    {/if}
  </div>
{/if}
