<script>
  import { onMount } from 'svelte';
  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';
  import { enableContainerScaling } from '$lib/util/design-system/index.js';

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   style?: string,
   *   aspectOnLandscape?: number,
   *   aspectOnPortrait?: number,
   *   enableScaling?: boolean,
   *   designLandscape?: {width: number, height: number},
   *   designPortrait?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   snippetLandscape?: import('svelte').Snippet,
   *   snippetPortrait?: import('svelte').Snippet,
   *   [attr: string]: any
   * }}
   */
  const {
    // > Style
    base = '',
    bg = '',
    classes = '',
    style = '',

    // > Functional properties
    aspectOnLandscape,
    aspectOnPortrait,

    // > Scaling options
    enableScaling = false,
    designLandscape = { width: 1920, height: 1080 },
    designPortrait = { width: 1080, height: 1920 },
    clamping = {
      ui: { min: 0.3, max: 2 },
      textBase: { min: 0.75, max: 1.5 },
      textHeading: { min: 0.75, max: 2.25 },
      textUi: { min: 0.5, max: 1.25 }
    },

    // > Snippets
    snippetLandscape,
    snippetPortrait
  } = $props();

  // > Game dimensions and state
  let windowWidth = $state();
  let windowHeight = $state();
  let gameWidth = $state();
  let gameHeight = $state();
  let isLandscape = $derived(windowWidth > windowHeight);

  // Game container reference
  let gameContainer = $state();

  // Update game dimensions based on window size and orientation
  $effect(() => {
    if (!windowWidth || !windowHeight) return;

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

  // Set up scaling if enabled, with orientation awareness
  $effect(() => {
    if (!enableScaling || !gameContainer || !gameWidth || !gameHeight) {
      return () => {}; // No-op cleanup if scaling not enabled or required elements missing
    }

    // Select the appropriate design based on orientation
    const activeDesign = isLandscape ? designLandscape : designPortrait;

    // console.debug(
    //   `GameBox scaling [${isLandscape ? 'landscape' : 'portrait'}]:`,
    //   `game: ${gameWidth}x${gameHeight}`,
    //   `design: ${activeDesign.width}x${activeDesign.height}`
    // );

    // Apply scaling with the current design based on orientation
    return enableContainerScaling({
      container: gameContainer,
      design: activeDesign,
      clamping,
      getDimensions: () => ({
        width: gameWidth,
        height: gameHeight
      })
    });
  });

  onMount(() => {
    const gameBoxNoScroll = 'game-box-no-scroll';
    const html = document.documentElement;
    html.classList.add(gameBoxNoScroll);

    return () => {
      html.classList.remove(gameBoxNoScroll);
    };
  });
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameHeight}
  <div
    data-component="game-box"
    data-orientation={isLandscape ? 'landscape' : 'portrait'}
    bind:this={gameContainer}
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

<style>
  :global(html.game-box-no-scroll) {
    overflow: clip;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  :global(html.game-box-no-scroll::-webkit-scrollbar) {
    display: none;
  }
</style>
