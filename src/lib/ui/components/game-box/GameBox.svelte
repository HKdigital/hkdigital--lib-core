<script>
  import { onMount } from 'svelte';

  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';

  /**
   * @typedef {{
   *   isLandscape: boolean,
   *   isPortrait: boolean,
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
   *   preserveOnOrientationChange?: boolean,
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

    preserveOnOrientationChange = true,

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

  let isLandscape = $state();

  $effect(() => {
    console.debug('getIsLandscape effect running', {
      isPwa,
      isAppleMobile,
      windowWidth,
      windowHeight,
      iosWindowWidth,
      iosWindowHeight
    });

    if (isPwa && isAppleMobile) {
      // For iOS PWA, update dimensions on window size change
      updateIosWidthHeight();
      isLandscape = iosWindowWidth > iosWindowHeight;
    } else {
      isLandscape = windowWidth > windowHeight;
    }
  });

  $inspect('isLandscape', isLandscape);
  $inspect('windowWidth/Height', windowWidth, windowHeight);
  $inspect('iosWindowWidth/Height', iosWindowWidth, iosWindowHeight);

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

  let show = $state(false);

  const isAppleMobile = /iPhone|iPod/.test(navigator.userAgent);

  let isPwa = $state(false);

  let os = $state();

  let isMobile = $state(false);

  let isDevMode = $state(false);

  // Check: always true for home app?
  let isFullscreen = $state(false);

  let supportsFullscreen = $state(false);

  function updateIosWidthHeight() {
    if (isPwa && isAppleMobile) {
      const angle = screen.orientation.angle;

      if (angle === 90 || angle === 270) {
        iosWindowWidth = screen.height;
        iosWindowHeight = screen.width;
      } else {
        iosWindowWidth = screen.width;
        iosWindowHeight = screen.height;
      }
      console.debug('updateIosWidthHeight', {
        angle,
        iosWindowWidth,
        iosWindowHeight
      });
    }
  }

  function updateOrientation(event) {
    console.debug('*** updateOrientation EVENT FIRED ***', {
      angle: event.target.angle,
      type: event.target.type
    });
    updateIosWidthHeight();
  }

  onMount(() => {
    supportsFullscreen = document.fullscreenEnabled;

    isMobile = getIsMobile();

    os = getOS();

    isFullscreen = getIsFullscreen();

    isPwa = window.matchMedia(
      '(display-mode: fullscreen) or (display-mode: standalone)'
    ).matches;

    updateIosWidthHeight();

    screen.orientation.addEventListener('change', updateOrientation);

    show = true;

    return () => {
      screen.orientation.removeEventListener('change', updateOrientation);
    };
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
    // console.debug('Request full screen');
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

  function requestDevmode() {
    isDevMode = true;
    // console.debug(isDevMode);
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

<!-- margin: /* top | right | bottom | left */ -->

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
      style:margin="{marginTop}px {marginRight}px {marginBottom}px {marginLeft}px"
      {style}
    >
      {#if show}
        {#if preserveOnOrientationChange}
          <!-- Preserve mode: render both orientations, toggle visibility -->
          {#if snippetRequireFullscreen}
            <!-- Require fullscreen -->
            {#if isFullscreen && !isDevMode}
              <!-- Landscape content -->
              <div class:hidden={!isLandscape}>
                {@render snippetLandscape({
                  isLandscape,
                  isPortrait: !isLandscape,
                  isMobile,
                  os,
                  isFullscreen,
                  isDevMode,
                  requestDevmode,
                  requestFullscreen,
                  gameWidth,
                  gameHeight
                })}
              </div>
              <!-- Portrait content -->
              <div class:hidden={isLandscape}>
                {@render snippetPortrait({
                  isLandscape,
                  isPortrait: !isLandscape,
                  isMobile,
                  os,
                  isFullscreen,
                  isDevMode,
                  requestDevmode,
                  requestFullscreen,
                  gameWidth,
                  gameHeight
                })}
              </div>
            {:else if supportsFullscreen && !isDevMode}
              <!-- Require fullscreen -->
              {@render snippetRequireFullscreen({
                isLandscape,
                isPortrait: !isLandscape,
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
                isLandscape,
                isPortrait: !isLandscape,
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
              <!-- Landscape content -->
              <div class:hidden={!isLandscape}>
                {@render snippetLandscape({
                  isLandscape,
                  isPortrait: !isLandscape,
                  isMobile,
                  os,
                  isFullscreen,
                  isDevMode,
                  requestDevmode,
                  requestFullscreen,
                  gameWidth,
                  gameHeight
                })}
              </div>
              <!-- Portrait content -->
              <div class:hidden={isLandscape}>
                {@render snippetPortrait({
                  isLandscape,
                  isPortrait: !isLandscape,
                  isMobile,
                  os,
                  isFullscreen,
                  isDevMode,
                  requestDevmode,
                  requestFullscreen,
                  gameWidth,
                  gameHeight
                })}
              </div>
            {/if}
          {:else}
            <!-- Do not require fullscreen -->
            <!-- Landscape content -->
            <div class:hidden={!isLandscape}>
              {@render snippetLandscape({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </div>
            <!-- Portrait content -->
            <div class:hidden={isLandscape}>
              {@render snippetPortrait({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </div>
          {/if}
        {:else}
          <!-- Destroy/recreate mode: original behavior -->
          {#if isLandscape}
            <!-- Landscape -->
            {#if snippetRequireFullscreen}
              <!-- Require fullscreen -->
              {#if isFullscreen && !isDevMode}
                {@render snippetLandscape({
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                isLandscape,
                isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                  isLandscape,
                  isPortrait: !isLandscape,
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
                isLandscape,
                isPortrait: !isLandscape,
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

  .hidden {
    visibility: hidden;
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
