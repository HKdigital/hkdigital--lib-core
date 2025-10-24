<script>
  import { onMount } from 'svelte';

  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';

  import ScaledContainer from './ScaledContainer.svelte';

  /**
   * @typedef {{
   *   isLandscape: boolean,
   *   isPortrait: boolean,
   *   isMobile:boolean,
   *   isIos:boolean,
   *   isAndroid:boolean,
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

    enableScaling,
    designLandscape,
    designPortrait,
    clamping,

    // > Snippets
    snippetLandscape,
    snippetPortrait,
    snippetRequireFullscreen,
    snippetInstallOnHomeScreen
  } = $props();

  // > Game dimensions and state
  let windowWidth = $state();
  let windowHeight = $state();

  let debouncedWindowWidth = $state();
  let debouncedWindowHeight = $state();

  let debounceTimer;

  let gameWidthOnPortrait = $state();
  let gameHeightOnPortrait = $state();

  let gameWidthOnLandscape = $state();
  let gameHeightOnLandscape = $state();

  let iosWindowWidth = $state();
  let iosWindowHeight = $state();

  let isLandscape = $state();

  let gameWidth = $derived.by( () => {
    if( isLandscape ) {
      return gameWidthOnLandscape;
    }
    else {
      return gameWidthOnPortrait;
    }
  } );

  let gameHeight = $derived.by( () => {
    if( isLandscape ) {
      return gameHeightOnLandscape;
    }
    else {
      return gameHeightOnPortrait;
    }
  } );

  const isAppleMobile = /iPhone|iPod/.test(navigator.userAgent);

  let os = $state();
  let isIos = $derived(os === 'iOS');
  let isAndroid = $derived(os === 'Android');

  // Debounce window dimensions on iOS to skip intermediate resize events
  let skipNextResize = false;
  let resetTimer;

  $effect(() => {
    if (isAppleMobile && windowWidth && windowHeight) {
      if (skipNextResize) {
        skipNextResize = false;
        return; // Skip first of the two resize events
      }

      // skipNextResize = true; // disabled to test <<

      debouncedWindowWidth = windowWidth;
      debouncedWindowHeight = windowHeight;

      // Reset flag after resize events settle
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        skipNextResize = false;
      }, 500);
    } else {
      // Non-iOS: use dimensions immediately
      debouncedWindowWidth = windowWidth;
      debouncedWindowHeight = windowHeight;
    }
  });

  // Update iOS dimensions when debounced window size changes
  $effect(() => {
    if (
      isPwa &&
      isAppleMobile &&
      debouncedWindowWidth &&
      debouncedWindowHeight
    ) {
      updateIosWidthHeight();
    }
  });

  $effect(() => {
    // Use matchMedia for orientation detection (works on all iOS versions)
    // This is more reliable than screen.orientation.angle
    const isPortraitMedia =
      typeof window !== 'undefined' &&
      window.matchMedia('(orientation: portrait)').matches;

    isLandscape = !isPortraitMedia;
  });

  // $inspect('isLandscape', isLandscape);
  // $inspect('windowWidth/Height', windowWidth, windowHeight);
  // $inspect('iosWindowWidth/Height', iosWindowWidth, iosWindowHeight);

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

    if (availWidth > availHeight) {
      gameWidthOnLandscape = getGameWidthOnLandscape({
        windowWidth: availWidth,
        windowHeight: availHeight,
        aspectOnLandscape
      });

      if( aspectOnLandscape )
      {
        gameHeightOnLandscape = gameWidthOnLandscape / aspectOnLandscape;
      }
      else {
        gameHeightOnLandscape = availHeight;
      }

      isLandscape = true;
    } else {
      gameWidthOnPortrait = getGameWidthOnPortrait({
        windowWidth: availWidth,
        windowHeight: availHeight,
        aspectOnPortrait
      });

      if( aspectOnPortrait )
      {
        gameHeightOnPortrait = gameWidthOnPortrait / aspectOnPortrait;
      }
      else {
        gameHeightOnPortrait = availHeight;
      }

      isLandscape = false;
    }
  });

  let show = $state(false);

  let isPwa = $state(false);

  let isMobile = $state(false);

  let isDevMode = $state(false);

  // Check: always true for home app?
  let isFullscreen = $state(false);

  let supportsFullscreen = $state(false);

  function updateIosWidthHeight() {
    if (isPwa && isAppleMobile) {
      const angle = screen.orientation.angle;

      // Use window.inner dimensions instead of screen dimensions
      // because screen.width/height don't rotate on iOS PWA
      if (angle === 90 || angle === 270) {
        iosWindowWidth = window.innerHeight;
        iosWindowHeight = window.innerWidth;
      } else {
        iosWindowWidth = window.innerWidth;
        iosWindowHeight = window.innerHeight;
      }
      // console.debug('updateIosWidthHeight', {
      //   angle,
      //   'window.innerWidth': window.innerWidth,
      //   'window.innerHeight': window.innerHeight,
      //   iosWindowWidth,
      //   iosWindowHeight
      // });
    }
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

    // Listen for orientation changes using matchMedia (works on all iOS)
    const portraitMediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = (e) => {
      isLandscape = !e.matches;

      // Update iOS dimensions if needed
      if (isPwa && isAppleMobile) {
        updateIosWidthHeight();
      }
    };
    portraitMediaQuery.addEventListener('change', handleOrientationChange);

    // App visibility detection for iOS debugging
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // console.log('App became visible:', {
        //   'window.innerWidth': window.innerWidth,
        //   'window.innerHeight': window.innerHeight,
        //   'screen.width': screen.width,
        //   'screen.height': screen.height,
        //   'screen.orientation.angle': screen.orientation.angle,
        //   'screen.orientation.type': screen.orientation.type,
        //   'matchMedia portrait':
        //     window.matchMedia('(orientation: portrait)').matches,
        //   'isLandscape': isLandscape,
        //   'gameWidth': gameWidth,
        //   'gameHeight': gameHeight,
        //   'iosWindowWidth': iosWindowWidth,
        //   'iosWindowHeight': iosWindowHeight
        // });

        // Force iOS dimension update when app becomes visible
        if (isPwa && isAppleMobile) {
          updateIosWidthHeight();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    show = true;

    return () => {
      portraitMediaQuery.removeEventListener('change', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  onMount(() => {
    const gameBoxNoScroll = 'game-box-no-scroll';
    const html = document.documentElement;
    html.classList.add(gameBoxNoScroll);

    // // Prevent page scroll while allowing child elements to scroll
    // const preventPageScroll = () => {
    //   window.scrollTo(0, 0);
    // };

    // window.addEventListener('scroll', preventPageScroll, { passive: true });

    // return () => {
    //   html.classList.remove(gameBoxNoScroll);
    //   window.removeEventListener('scroll', preventPageScroll);
    // };
    return () => {
      html.classList.remove(gameBoxNoScroll);
    }
  });


  function getOS() {
    if (isAppleMobile) {
      return 'iOS';
    } else if (/Android/.test(navigator.userAgent)) {
      return 'Android';
    } else {
      return 'unknown';
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
  <div
    class:center
    style:height={center ? `${iosWindowHeight ?? windowHeight}px` : undefined}
  >
    <div
      data-component="game-box"
      data-orientation={isLandscape ? 'landscape' : 'portrait'}
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
        <!-- Render both orientations, toggle visibility to preserve state -->
        {#if snippetRequireFullscreen}
          <!-- Require fullscreen -->
          {#if isFullscreen && !isDevMode}
            <!-- Landscape content -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={designLandscape}
              {clamping}
              width={gameWidthOnLandscape}
              height={gameHeightOnLandscape}
              hidden={!isLandscape}
            >
              {@render snippetLandscape({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
            <!-- Portrait content -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={designPortrait}
              {clamping}
              width={gameWidthOnPortrait}
              height={gameHeightOnPortrait}
              hidden={isLandscape}
            >
              {@render snippetPortrait({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
          {:else if supportsFullscreen && !isDevMode}
            <!-- Require fullscreen -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={isLandscape ? designLandscape : designPortrait}
              {clamping}
              width={gameWidth}
              height={gameHeight}
            >
              {@render snippetRequireFullscreen({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
          {:else if isMobile && snippetInstallOnHomeScreen && !isDevMode}
            <!-- Require install on home screen on mobile -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={isLandscape ? designLandscape : designPortrait}
              {clamping}
              width={gameWidth}
              height={gameHeight}
            >
              {@render snippetInstallOnHomeScreen({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
          {:else}
            <!-- Landscape content -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={designLandscape}
              {clamping}
              width={gameWidthOnLandscape}
              height={gameHeightOnLandscape}
              hidden={!isLandscape}
            >
              {@render snippetLandscape({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
            <!-- Portrait content -->
            <ScaledContainer
              enableScaling={enableScaling}
              design={designPortrait}
              {clamping}
              width={gameWidthOnPortrait}
              height={gameHeightOnPortrait}
              hidden={isLandscape}
            >
              {@render snippetPortrait({
                isLandscape,
                isPortrait: !isLandscape,
                isMobile,
                isIos,
                isAndroid,
                os,
                isFullscreen,
                isDevMode,
                requestDevmode,
                requestFullscreen,
                gameWidth,
                gameHeight
              })}
            </ScaledContainer>
          {/if}
        {:else}
          <!-- Do not require fullscreen -->
          <!-- Landscape content -->
          <ScaledContainer
            enableScaling={enableScaling}
            design={designLandscape}
            {clamping}
            width={gameWidthOnLandscape}
            height={gameHeightOnLandscape}
            hidden={!isLandscape}
          >
            {@render snippetLandscape({
              isLandscape,
              isPortrait: !isLandscape,
              isMobile,
              isIos,
              isAndroid,
              os,
              isFullscreen,
              isDevMode,
              requestDevmode,
              requestFullscreen,
              gameWidth,
              gameHeight
            })}
          </ScaledContainer>
          <!-- Portrait content -->
          <ScaledContainer
            enableScaling={enableScaling}
            design={designPortrait}
            {clamping}
            width={gameWidthOnPortrait}
            height={gameHeightOnPortrait}
            hidden={isLandscape}
          >
            {@render snippetPortrait({
              isLandscape,
              isPortrait: !isLandscape,
              isMobile,
              isIos,
              isAndroid,
              os,
              isFullscreen,
              isDevMode,
              requestDevmode,
              requestFullscreen,
              gameWidth,
              gameHeight
            })}
          </ScaledContainer>
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
    /* Prevent all scrolling - clip is stricter than hidden */
    overflow: clip;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    /* Prevent bounce/overscroll on iOS */
    overscroll-behavior: none;
    -webkit-overflow-scrolling: auto;
  }
  :global(html.game-box-no-scroll::-webkit-scrollbar) {
    display: none;
  }
</style>
