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

  import { getIsPwa, getIsFullscreen } from '$lib/browser/info/display.js';

  import ScaledContainer from './ScaledContainer.svelte';

  /**
   * @typedef {import('./typedef.js').SnippetParams} SnippetParams
   */

  /**
   * @typedef {import('./typedef.js').GameBoxSnippet} GameBoxSnippet
   */

  /**
   * @type {{
   *   class?: string,
   *   base?: string,  // Deprecated: use 'class' instead
   *   bg?: string,  // Deprecated: use 'class' instead
   *   classes?: string,  // Deprecated: use 'class' instead
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
   *   allowDevModeOnLocalhost?: boolean,
   *   debug?: boolean,
   *   [attr: string]: any
   * }}
   */
  const {
    // > Style
    class: className,
    base,  // Deprecated: kept for backward compatibility
    bg,  // Deprecated: kept for backward compatibility
    classes,  // Deprecated: kept for backward compatibility
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

    allowDevModeOnLocalhost = true,
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

  let gameWidth = $derived.by(() => {
    if (isLandscape) {
      return gameWidthOnLandscape;
    } else {
      return gameWidthOnPortrait;
    }
  });

  let gameHeight = $derived.by(() => {
    if (isLandscape) {
      return gameHeightOnLandscape;
    } else {
      return gameHeightOnPortrait;
    }
  });

  // iPad is also considered Apple mobile
  const isAppleMobile = getIsAppleMobile();

  let isIos = $state(false);
  let isAndroid = $state(false);
  let isIpadOS = $state(false);

  // Update iOS dimensions when window size changes
  $effect(() => {
    if (isPwa && isAppleMobile && windowWidth && windowHeight) {
      updateIosWidthHeightAndOrientation();
    }
  });

  $effect(() => {
    // Use matchMedia as a trigger for orientation changes
    // The actual orientation is determined in updateIosWidthHeightAndOrientation()
    if (typeof window !== 'undefined') {
      const isPortraitMedia = window.matchMedia(
        '(orientation: portrait)'
      ).matches;

      // Trigger iOS dimension update when orientation might have changed
      if (isPwa && isAppleMobile) {
        updateIosWidthHeightAndOrientation();
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
      console.log(
        '[GameBox] iosWindowWidth/Height:',
        iosWindowWidth,
        iosWindowHeight
      );

      console.log({
        isPwa,
        isAppleMobile,
        isMobile,
        isIos,
        isAndroid,
        isFullscreen
      });
    }
  });

  // Update game dimensions based on window size and orientation
  $effect(() => {
    const width = iosWindowWidth ?? windowWidth;
    const height = iosWindowHeight ?? windowHeight;

    if (!width || !height) return;

    const availWidth = width - marginLeft - marginRight;
    const availHeight = height - marginTop - marginBottom;

    if (debug) {
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

      if (aspectOnLandscape) {
        gameHeightOnLandscape = gameWidthOnLandscape / aspectOnLandscape;
      } else {
        gameHeightOnLandscape = availHeight;
      }
    } else {
      gameWidthOnPortrait = getGameWidthOnPortrait({
        windowWidth: availWidth,
        windowHeight: availHeight,
        aspectOnPortrait
      });

      if (aspectOnPortrait) {
        gameHeightOnPortrait = gameWidthOnPortrait / aspectOnPortrait;
      } else {
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

  function updateIosWidthHeightAndOrientation() {
    if (isAppleMobile) {
      // unreliable on ios >>
      // const angle = screen.orientation.angle;
      // if( window.matchMedia('(orientation: portrait)').matches ) {
      //   isLandscape = false;
      // }
      // else {
      //   isLandscape = true;
      // }

      // unreliable on ios >>
      // switch( screen.orientation.type ) {
      //   case "portrait-primary":
      //   case "portrait-secondary":
      //     isLandscape = false;
      //     break;
      //   default:
      //     isLandscape = true;
      //     break;
      // }

      // Use window.inner dimensions instead of screen dimensions
      // because screen.width/height don't rotate on iOS PWA
      // if (isLandscape) {
      //   iosWindowWidth = window.innerHeight;
      //   iosWindowHeight = window.innerWidth;
      // } else {
      //   iosWindowWidth = window.innerWidth;
      //   iosWindowHeight = window.innerHeight;
      // }

      iosWindowWidth = window.innerWidth;
      iosWindowHeight = window.innerHeight;

      if (iosWindowHeight > iosWindowWidth) {
        isLandscape = false;
      } else {
        isLandscape = true;
      }

      if (debug) {
        console.debug('updateIosWidthHeightAndOrientation', {
          'screen.orientation.type': screen.orientation.type,
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

    updateIosWidthHeightAndOrientation();

    // Listen for orientation changes using matchMedia (works on all iOS)
    const portraitMediaQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = (e) => {
      // Update iOS dimensions if needed
      if (isAppleMobile) {
        updateIosWidthHeightAndOrientation();
      } else {
        // For non-iOS, matchMedia is reliable
        // as well is window width and height
        isLandscape = !e.matches;
      }
    };
    portraitMediaQuery.addEventListener('change', handleOrientationChange);

    // App visibility detection for iOS debugging
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (debug) {
          console.log('App became visible:', {
            'window.innerWidth': window.innerWidth,
            'window.innerHeight': window.innerHeight,
            'screen.width': screen.width,
            'screen.height': screen.height,
            'screen.orientation.angle': screen.orientation.angle,
            'screen.orientation.type': screen.orientation.type,
            'matchMedia portrait': window.matchMedia('(orientation: portrait)')
              .matches,
            isLandscape: isLandscape,
            gameWidth: gameWidth,
            gameHeight: gameHeight,
            iosWindowWidth: iosWindowWidth,
            iosWindowHeight: iosWindowHeight
          });
        }

        // Force iOS dimension update when app becomes visible
        if (isPwa && isAppleMobile) {
          updateIosWidthHeightAndOrientation();
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
    };
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
    if (allowDevModeOnLocalhost && location.hostname === 'localhost') {
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

  let snippetParams = $derived({
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
  });

  // $inspect('snippetParams', snippetParams);
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<!-- margin: /* top | right | bottom | left */ -->

{#if gameHeight}
  <div
    data-about="game-box-centering"
    class:center
    style:height={center ? `${iosWindowHeight ?? windowHeight}px` : undefined}
  >
    <div
      data-component="game-box"
      data-orientation={isLandscape ? 'landscape' : 'portrait'}
      class="{base ?? ''} {bg ?? ''} {className ?? classes ?? ''}"
      class:isMobile
      style:position="relative"
      style:width="{gameWidth}px"
      style:height="{gameHeight}px"
      style:--game-width={gameWidth}
      style:--game-height={gameHeight}
      style:margin="{marginTop}px {marginRight}px {marginBottom}px {marginLeft}px"
      {style}
    >
      {#if show && clamping }

        {#if snippetRequireFullscreen}

          {#if isFullscreen && !isDevMode}

            <!--
              snippetRequireFullscreen &&
              Fullscreen
              => Render both orientations, set visibility to preserve state
            -->

            <!-- Landscape content -->
            <ScaledContainer
              {enableScaling}
              design={designLandscape}
              {clamping}
              width={gameWidthOnLandscape}
              height={gameHeightOnLandscape}
              snippet={snippetLandscape}
              {snippetParams}
              hidden={!isLandscape}
            ></ScaledContainer>

            <!-- Portrait content -->
            <ScaledContainer
              {enableScaling}
              design={designPortrait}
              {clamping}
              width={gameWidthOnPortrait}
              height={gameHeightOnPortrait}
              snippet={snippetPortrait}
              {snippetParams}
              hidden={isLandscape}
            ></ScaledContainer>

          {:else if isMobile && snippetInstallOnHomeScreen && !isPwa && !isDevMode}

            <!--
              snippetRequireFullscreen &&
              isMobile &&
              snippetInstallOnHomeScreen &&
              Not PWA
              => show install on home screen message
            -->

            <ScaledContainer
              {enableScaling}
              design={isLandscape ? designLandscape : designPortrait}
              {clamping}
              width={gameWidth}
              height={gameHeight}
              snippet={snippetInstallOnHomeScreen}
              {snippetParams}
            ></ScaledContainer>

          {:else if supportsFullscreen && !isDevMode}

            <!--
              snippetRequireFullscreen &&
              Fullscreen supported &&
              Not fullscreen &&
              (Not mobile OR no install snippet OR already PWA)
              => show fullscreen required message
            -->

            <ScaledContainer
              {enableScaling}
              design={isLandscape ? designLandscape : designPortrait}
              {clamping}
              width={gameWidth}
              height={gameHeight}
              snippet={snippetRequireFullscreen}
              {snippetParams}
            ></ScaledContainer>

          {:else}
            <!--
              snippetRequireFullscreen &&
              (Dev mode OR
               Fullscreen not supported OR
               Not mobile OR
               No install snippet OR
               Already PWA)
              => show game content
            -->

            <!-- Landscape content -->

            <ScaledContainer
              {enableScaling}
              design={designLandscape}
              {clamping}
              width={gameWidthOnLandscape}
              height={gameHeightOnLandscape}
              snippet={snippetLandscape}
              {snippetParams}
              hidden={!isLandscape}
            ></ScaledContainer>

            <!-- Portrait content -->
            <ScaledContainer
              {enableScaling}
              design={designPortrait}
              {clamping}
              width={gameWidthOnPortrait}
              height={gameHeightOnPortrait}
              snippet={snippetPortrait}
              {snippetParams}
              hidden={isLandscape}
            ></ScaledContainer>
          {/if}
        {:else}
          <!-- Do not require fullscreen -->

          <!-- Landscape content -->
          <ScaledContainer
            {enableScaling}
            design={designLandscape}
            {clamping}
            width={gameWidthOnLandscape}
            height={gameHeightOnLandscape}
            snippet={snippetLandscape}
            {snippetParams}
            hidden={!isLandscape}
          ></ScaledContainer>

          <!-- Portrait content -->
          <ScaledContainer
            {enableScaling}
            design={designPortrait}
            {clamping}
            width={gameWidthOnPortrait}
            height={gameHeightOnPortrait}
            snippet={snippetPortrait}
            {snippetParams}
            hidden={isLandscape}
          ></ScaledContainer>
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
