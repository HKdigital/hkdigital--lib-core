<script>
  import { onMount } from 'svelte';

  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';

  import { enableContainerScaling } from '$lib/util/design-system/index.js';
  // import { enableContainerScaling } from '@hkdigital/lib-sveltekit/util/design-system/index.js';

  /**
   * @typedef {{
   *   isMobile:boolean,
   *   os:'Android'|'iOS',
   *   isFullscreen:boolean,
   *   isDevMode:boolean,
   *   requestDevmode:function,
   *   requestFullscreen:function,
   *   gameWidth: number,
   *   gameHeight: number
   * }} SnippetParams
   */

  /**
   * @typedef {import('svelte').Snippet<[SnippetParams]>} GameBoxSnippet
   */

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   style?: string,
   *   aspectOnLandscape?: number,
   *   aspectOnPortrait?: number,
   *   marginLeft?: number,
   *   marginRight?: number,
   *   marginTop?: number,
   *   marginBottom?: number,
   *   center?: boolean,
   *   enableScaling?: boolean,
   *   designLandscape?: {width: number, height: number},
   *   designPortrait?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   snippetLandscape?:GameBoxSnippet,
   *   snippetPortrait?: GameBoxSnippet,
   *   snippetRequireFullscreen?: GameBoxSnippet,
   *   snippetInstallOnHomeScreen?: GameBoxSnippet,
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

    marginLeft = 0,
    marginRight = 0,

    marginTop = 0,
    marginBottom = 0,

    center,

    // > Scaling options
    enableScaling = false,
    designLandscape = { width: 1920, height: 1080 },
    designPortrait = { width: 1920, height: 1080 },
    clamping = {
      ui: { min: 0.3, max: 2 },
      textBase: { min: 0.75, max: 1.5 },
      textHeading: { min: 0.75, max: 2.25 },
      textUi: { min: 0.5, max: 1.25 }
    },

    // > Snippets
    snippetLandscape,
    snippetPortrait,
    snippetRequireFullscreen,
    snippetInstallOnHomeScreen
  } = $props();

  // > Game dimensions and state
  let windowWidth = $state();
  let windowHeight = $state();

  let gameWidth = $state();
  let gameHeight = $state();

  let iosWindowWidth = $state();
  let iosWindowHeight = $state();

  function getIsLandscape() {
    if (isPwa && isAppleMobile) {
      return iosWindowWidth > iosWindowHeight;
    } else {
      return windowWidth > windowHeight;
    }
  }

  let isLandscape = $state();

  // $derived.by(getIsLandscape);

  $effect(() => {
    isLandscape = getIsLandscape();
  });

  // Game container reference
  let gameContainer = $state();

  // Update game dimensions based on window size and orientation
  $effect(() => {
    const width = iosWindowWidth ?? windowWidth;
    const height = iosWindowHeight ?? windowHeight;

    if (!width || !height) return;

    const availWidth = width - marginLeft - marginRight;
    const availHeight = height - marginTop - marginBottom;

    // console.debug('GameBox margins:', {
    //   marginLeft,
    //   marginRight,
    //   marginTop,
    //   marginBottom
    // });

    let gameAspect;

    if (availWidth > availHeight) {
      gameWidth = getGameWidthOnLandscape({
        windowWidth: availWidth,
        windowHeight: availHeight,
        aspectOnLandscape
      });
      gameAspect = aspectOnLandscape;
    } else {
      gameWidth = getGameWidthOnPortrait({
        windowWidth: availWidth,
        windowHeight: availHeight,
        aspectOnPortrait
      });
      gameAspect = aspectOnPortrait;
    }

    if (gameAspect) {
      gameHeight = gameWidth / gameAspect;
    } else {
      gameHeight = availHeight;
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

  let show = $state(false);

  const isAppleMobile = /iPhone|iPod/.test(navigator.userAgent);

  let isPwa = $state(false);

  let os = $state();

  let isMobile = $state(false);

  let isDevMode = $state(false);

  // Check: always true for home app?
  let isFullscreen = $state(false);

  let supportsFullscreen = $state(false);

  onMount(() => {
    supportsFullscreen = document.fullscreenEnabled;

    isMobile = getIsMobile();

    os = getOS();

    // Run before show
    isFullscreen = !!document.fullscreenElement;

    isPwa = window.matchMedia(
      '(display-mode: fullscreen) or (display-mode: standalone)'
    ).matches;

    isLandscape = getIsLandscape();

    show = true;

    function updateIosWidthHeight() {
      // const isPwa = window.matchMedia(
      //   '(display-mode: fullscreen) or (display-mode: standalone)'
      // ).matches;

      if (isPwa && isAppleMobile) {
        const angle = screen.orientation.angle;

        if (angle === 90 || angle === 270) {
          iosWindowWidth = screen.height;
          iosWindowHeight = screen.width;
        } else {
          iosWindowWidth = screen.width;
          iosWindowHeight = screen.height;
        }
        // console.debug( { iosWindowWidth, iosWindowHeight } );
      }
    }

    updateIosWidthHeight();

    function updateOrientation(event) {
      // console.debug('updateOrientation');
      const type = event.target.type;
      const angle = event.target.angle;

      // isPwa = window.matchMedia(
      //   '(display-mode: fullscreen) or (display-mode: standalone)'
      // ).matches;

      updateIosWidthHeight();

      console.debug(
        `ScreenOrientation change: ${type}, ${angle} degrees.`,
        isPwa,
        windowWidth,
        windowHeight,
        screen.width,
        screen.height,
        iosWindowWidth,
        iosWindowHeight
      );

      // if( angle
    }

    $effect(() => {
      screen.orientation.addEventListener('change', updateOrientation);

      return () => {
        screen.orientation.removeEventListener('change', updateOrientation);
      };
    });

    //
  });

  onMount(() => {
    const gameBoxNoScroll = 'game-box-no-scroll';
    const html = document.documentElement;
    html.classList.add(gameBoxNoScroll);

    return () => {
      html.classList.remove(gameBoxNoScroll);
    };
  });

  function getOS() {
    if (isAppleMobile) {
      return 'iOS';
    } else if (/Android/.test(navigator.userAgent)) {
      return 'Android';
    }
  }

  /**
   * Returns true if a device is a mobile phone (or similar)
   */
  function getIsMobile() {
    // @ts-ignore
    if (navigator?.userAgentData?.mobile !== undefined) {
      // Supports for mobile flag
      // @ts-ignore
      return navigator.userAgentData.mobile;
    } else if (isAppleMobile) {
      return true;
    } else if (/Android/.test(navigator.userAgent)) {
      return true;
    }

    return false;
  }

  /**
   * Returns true if the window is in full screen
   * - Checks if CSS thinks we're in fullscreen mode
   * - Checks if there is a fullscreen element (for safari)
   */
  function getIsFullscreen() {
    if (
      window.matchMedia(
        '(display-mode: fullscreen) or (display-mode: standalone)'
      ).matches
    ) {
      return true;
    } else if (document.fullscreenElement) {
      // Safari
      return true;
    }

    return false;
  }

  async function requestFullscreen() {
    console.debug('Request full screen');
    show = false;

    await document.documentElement.requestFullscreen();
    isFullscreen = true;

    setTimeout(() => {
      show = true;
    }, 1000);
  }

  // async function exitFullscreen() {
  //   console.debug('Exit full screen');
  //   show = false;

  //   await document.exitFullscreen();
  //   isFullscreen = false;

  //   setTimeout( () => { show = true; }, 1000 );
  // }

  $effect(() => {
    // Update isFullscreen if window width or height changes

    windowWidth;
    windowHeight;

    isFullscreen = getIsFullscreen();

    // if( !isFullscreen )
    // {
    //   show = false;
    //   setTimeout( () => { show = true; }, 1000 );
    // }

    // console.debug('isFullscreen', isFullscreen);
  });

  isDevMode = false;

  function requestDevmode() {
    isDevMode = true;
    console.debug(isDevMode);
  }

  $effect(() => {
    if (location.hostname === 'localhost') {
      isDevMode = true;
    }
  });

  $effect(() => {
    if (isFullscreen) {
      const url = new URL(window.location.href);
      url.searchParams.set('preset', 'cinema');
      window.history.pushState({}, '', url);
    }
  });
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameHeight}
  <div class:center>
    <div
      data-component="game-box"
      data-orientation={isLandscape ? 'landscape' : 'portrait'}
      bind:this={gameContainer}
      class="{base} {bg} {classes}"
      class:isMobile
      style:width="{gameWidth}px"
      style:height="{gameHeight}px"
      style:--game-width={gameWidth}
      style:--game-height={gameHeight}
      style:margin-left="{marginLeft}px"
      style:margin-right="{marginRight}px"
      style:margin-top="{marginTop}px"
      style:margin-bottom="{marginBottom}px"
      {style}
    >
      {#if show}
        {#if isLandscape}
          <!-- Landscape -->
          {#if snippetRequireFullscreen}
            <!-- Require fullscreen -->
            {#if isFullscreen && !isDevMode}
              {@render snippetLandscape({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else if supportsFullscreen && !isDevMode}
              <!-- Require fullscreen (on landscape) -->
              {@render snippetRequireFullscreen({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else if isMobile && snippetInstallOnHomeScreen && !isDevMode}
              <!-- Require install on home screen on mobile -->
              {@render snippetInstallOnHomeScreen({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else}
              {@render snippetLandscape({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {/if}
          {:else}
            <!-- Do not require fullscreen -->
            <!-- *we do not try install home app -->
            {@render snippetLandscape({
              isMobile,
              os,
              isFullscreen,
              isDevMode,
              requestDevmode,
              requestFullscreen,
              gameWidth,
              gameHeight
            })}
          {/if}
        {:else}
          <!-- Portrait -->
          {#if snippetRequireFullscreen}
            <!-- Require fullscreen -->
            {#if isFullscreen && !isDevMode}
              {@render snippetPortrait({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else if supportsFullscreen && !isDevMode}
              <!-- Require fullscreen (on landscape) -->
              {@render snippetRequireFullscreen({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else if isMobile && snippetInstallOnHomeScreen && !isDevMode}
              <!-- Require install on home screen on mobile -->
              {@render snippetInstallOnHomeScreen({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {:else}
              {@render snippetPortrait({
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            {/if}
          {:else}
            <!-- Do not require fullscreen -->
            <!-- *we do not try install home app -->
            {@render snippetPortrait({
              isMobile,
              os,
              isFullscreen,
              isDevMode,
              requestDevmode,
              requestFullscreen,
              gameWidth,
              gameHeight
            })}
          {/if}
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .center {
    display: grid;
    height: 100lvh;
    display: grid;
    justify-items: center;
    align-items: center;
    /* border: solid 1px red;*/
  }

  :global(html.game-box-no-scroll) {
    overflow: clip;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  :global(html.game-box-no-scroll::-webkit-scrollbar) {
    display: none;
  }
</style>
