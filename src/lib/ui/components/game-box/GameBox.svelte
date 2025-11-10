<script>
  import { onMount } from 'svelte';

  import {
    getGameWidthOnLandscape,
    getGameWidthOnPortrait
  } from './gamebox.util.js';

  import {
    getIsAppleMobile,
    getIsIpadOS,
    getIsMobile
  } from '$lib/browser/info/device.js';

  import {
    getIsPwa,
    getIsFullscreen
  } from '$lib/browser/info/display.js';

  import ScaledContainer from './ScaledContainer.svelte';

  /**
   * @typedef {import('./typedef.js').SnippetParams} SnippetParams
   */

  /**
   * @typedef {import('./typedef.js').GameBoxSnippet} GameBoxSnippet
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
   *   debug?: boolean,
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
    snippetInstallOnHomeScreen,

    debug = false
  } = $props();

  // > Game dimensions and state
  let windowWidth = $state();
  let windowHeight = $state();

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

  // iPad is also considered Apple mobile
  const isAppleMobile = getIsAppleMobile();

  let isIos = $state(false);
  let isAndroid = $state(false);
  let isIpadOS = $state(false);

  // Update iOS dimensions when window size changes
  $effect(() => {
    if (
      isPwa &&
      isAppleMobile &&
      windowWidth &&
      windowHeight
    ) {
      updateIosWidthHeight();
    }
  });

  $effect(() => {
    // Use matchMedia as a trigger for orientation changes
    // The actual orientation is determined in updateIosWidthHeight()
    if (typeof window !== 'undefined') {
      const isPortraitMedia =
        window.matchMedia('(orientation: portrait)').matches;

      // Trigger iOS dimension update when orientation might have changed
      if (isPwa && isAppleMobile) {
        updateIosWidthHeight();
      } else {
        // For non-iOS, matchMedia is reliable
        isLandscape = !isPortraitMedia;
      }
    }
  });

  // Use $effect for conditional debugging instead of $inspect
  $effect(() => {
    if (debug) {
      console.log('[GameBox] isLandscape:', isLandscape);
      console.log('[GameBox] windowWidth/Height:', windowWidth, windowHeight);
      console.log('[GameBox] iosWindowWidth/Height:',
        iosWindowWidth, iosWindowHeight);
    }
  });

  // Update game dimensions based on window size and orientation
  $effect(() => {
    const width = iosWindowWidth ?? windowWidth;
    const height = iosWindowHeight ?? windowHeight;

    if (!width || !height) return;

    const availWidth = width - marginLeft - marginRight;
    const availHeight = height - marginTop - marginBottom;

    if( debug )
    {
      console.debug('GameBox margins:', {
        marginLeft,
        marginRight,
        marginTop,
        marginBottom
      });
    }

    if (availWidth > availHeight) {
      // Calculate game dimensions for both orientations
      // Orientation is determined by matchMedia/screen.orientation.angle,
      // not by dimension comparison
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
    }
    else {
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

      // Use screen.orientation.angle as the source of truth
      // angle 90/270 = landscape, angle 0/180 = portrait
      isLandscape = (angle === 90 || angle === 270);

      // Use window.inner dimensions instead of screen dimensions
      // because screen.width/height don't rotate on iOS PWA
      // if (angle === 90 || angle === 270) {
      //   iosWindowWidth = window.innerHeight;
      //   iosWindowHeight = window.innerWidth;
      // } else {
      //   iosWindowWidth = window.innerWidth;
      //   iosWindowHeight = window.innerHeight;
      // }

      iosWindowWidth = window.innerWidth;
      iosWindowHeight = window.innerHeight;

      if( debug )
      {
        console.debug('updateIosWidthHeight', {
          angle,
          isLandscape,
          'window.innerWidth': window.innerWidth,
          'window.innerHeight': window.innerHeight,
          iosWindowWidth,
          iosWindowHeight
        });
      }
    }
  }

  onMount(() => {
    supportsFullscreen = document.fullscreenEnabled;

    isMobile = getIsMobile();

    isIos = isAppleMobile;
    isAndroid = !isAppleMobile && /Android/.test(navigator.userAgent);
    isIpadOS = getIsIpadOS();

    isFullscreen = getIsFullscreen();

    isPwa = getIsPwa();

    updateIosWidthHeight();

    // Listen for orientation changes using matchMedia (works on all iOS)
    const portraitMediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = (e) => {
      // Update iOS dimensions if needed
      if (isPwa && isAppleMobile) {
        updateIosWidthHeight();
      } else {
        // For non-iOS, matchMedia is reliable
        isLandscape = !e.matches;
      }
    };
    portraitMediaQuery.addEventListener('change', handleOrientationChange);

    // App visibility detection for iOS debugging
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {

        if( debug ) {
          console.log('App became visible:', {
            'window.innerWidth': window.innerWidth,
            'window.innerHeight': window.innerHeight,
            'screen.width': screen.width,
            'screen.height': screen.height,
            'screen.orientation.angle': screen.orientation.angle,
            'screen.orientation.type': screen.orientation.type,
            'matchMedia portrait':
              window.matchMedia('(orientation: portrait)').matches,
            'isLandscape': isLandscape,
            'gameWidth': gameWidth,
            'gameHeight': gameHeight,
            'iosWindowWidth': iosWindowWidth,
            'iosWindowHeight': iosWindowHeight
          });
        }

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
                isIpadOS,
                isPwa,
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
                isIpadOS,
                isPwa,
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
                isIpadOS,
                isPwa,
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
                isIpadOS,
                isPwa,
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
                isIpadOS,
                isPwa,
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
                isIpadOS,
                isPwa,
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
