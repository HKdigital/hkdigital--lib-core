<script>
  import { onMount } from 'svelte';

  // Reactive measurements
  let windowWidth = $state();
  let windowHeight = $state();

  let screenWidth = $state();
  let screenHeight = $state();
  let screenAvailWidth = $state();
  let screenAvailHeight = $state();

  let visualViewportWidth = $state();
  let visualViewportHeight = $state();
  let visualViewportOffsetLeft = $state();
  let visualViewportOffsetTop = $state();
  let visualViewportScale = $state();

  let iosWindowWidth = $state();
  let iosWindowHeight = $state();

  let orientation = $state('unknown');
  let screenOrientationAngle = $state();
  let screenOrientationType = $state();

  let safeAreaTop = $state(0);
  let safeAreaRight = $state(0);
  let safeAreaBottom = $state(0);
  let safeAreaLeft = $state(0);

  let isPwa = $state(false);
  let isIos = $state(false);

  // Event log with timestamps
  let eventLog = $state([]);
  let maxLogEntries = 50;

  // Toggles for different event types
  let showResizeEvents = $state(true);
  let showOrientationEvents = $state(true);
  let showVisualViewportEvents = $state(true);
  let showScreenOrientationEvents = $state(true);
  let showMatchMediaEvents = $state(true);

  function addLog(message, category = 'info') {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });

    const logEntry = `[${timestamp}] [${category}] ${message}`;
    console.log(logEntry);

    eventLog = [
      { timestamp, message, category },
      ...eventLog.slice(0, maxLogEntries - 1)
    ];
  }

  function clearLog() {
    eventLog = [];
  }

  function updateMeasurements() {
    // Window dimensions
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    // Screen dimensions
    screenWidth = window.screen.width;
    screenHeight = window.screen.height;
    screenAvailWidth = window.screen.availWidth;
    screenAvailHeight = window.screen.availHeight;

    // Visual viewport
    if (window.visualViewport) {
      visualViewportWidth = window.visualViewport.width;
      visualViewportHeight = window.visualViewport.height;
      visualViewportOffsetLeft = window.visualViewport.offsetLeft;
      visualViewportOffsetTop = window.visualViewport.offsetTop;
      visualViewportScale = window.visualViewport.scale;
    }

    // Screen orientation
    if (window.screen.orientation) {
      screenOrientationAngle = window.screen.orientation.angle;
      screenOrientationType = window.screen.orientation.type;
    }

    // matchMedia orientation (most reliable on iOS)
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    orientation = isPortrait ? 'portrait' : 'landscape';

    // iOS-specific dimensions (for PWA)
    if (isPwa && isIos && window.screen.orientation) {
      const angle = window.screen.orientation.angle;
      if (angle === 90 || angle === 270) {
        iosWindowWidth = window.innerHeight;
        iosWindowHeight = window.innerWidth;
      } else {
        iosWindowWidth = window.innerWidth;
        iosWindowHeight = window.innerHeight;
      }
    }

    // Safe area insets
    updateSafeAreaInsets();
  }

  function updateSafeAreaInsets() {
    const computedStyle = getComputedStyle(document.documentElement);
    safeAreaTop =
      parseInt(
        computedStyle.getPropertyValue('--safe-area-inset-top') || '0'
      ) || 0;
    safeAreaRight =
      parseInt(
        computedStyle.getPropertyValue('--safe-area-inset-right') || '0'
      ) || 0;
    safeAreaBottom =
      parseInt(
        computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'
      ) || 0;
    safeAreaLeft =
      parseInt(
        computedStyle.getPropertyValue('--safe-area-inset-left') || '0'
      ) || 0;
  }

  onMount(() => {
    // Detect PWA mode
    isPwa = window.matchMedia(
      '(display-mode: fullscreen), (display-mode: standalone)'
    ).matches;

    // Detect iOS
    isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);

    // Initial measurements
    updateMeasurements();
    addLog('Component mounted', 'mount');

    // Window resize event
    const handleResize = () => {
      if (showResizeEvents) {
        addLog(
          `window resize: ${window.innerWidth}x${window.innerHeight}`,
          'resize'
        );
      }
      updateMeasurements();
    };
    window.addEventListener('resize', handleResize);

    // Orientation change event (legacy)
    const handleOrientationChange = () => {
      if (showOrientationEvents) {
        addLog('orientationchange event fired', 'orientation');
      }

      // iOS needs delay for dimensions to stabilize
      setTimeout(() => {
        if (showOrientationEvents) {
          addLog(
            'orientationchange: dimensions after 800ms delay',
            'orientation'
          );
        }
        updateMeasurements();
      }, 800);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    // Screen orientation change (modern API)
    if (window.screen.orientation) {
      const handleScreenOrientationChange = () => {
        if (showScreenOrientationEvents) {
          addLog(
            `screen.orientation.change: ${window.screen.orientation.type} (${window.screen.orientation.angle}°)`,
            'screen-orientation'
          );
        }
        updateMeasurements();
      };
      window.screen.orientation.addEventListener(
        'change',
        handleScreenOrientationChange
      );
    }

    // matchMedia orientation change (most reliable on iOS)
    const portraitMediaQuery = window.matchMedia('(orientation: portrait)');
    const handleMatchMediaChange = (e) => {
      if (showMatchMediaEvents) {
        addLog(
          `matchMedia orientation: ${e.matches ? 'portrait' : 'landscape'}`,
          'matchmedia'
        );
      }
      updateMeasurements();
    };
    portraitMediaQuery.addEventListener('change', handleMatchMediaChange);

    // Visual viewport events
    if (window.visualViewport) {
      let pendingUpdate = false;

      const scheduleViewportUpdate = (eventType) => {
        if (pendingUpdate) return;
        pendingUpdate = true;

        requestAnimationFrame(() => {
          pendingUpdate = false;
          if (showVisualViewportEvents) {
            addLog(
              `visualViewport.${eventType}: ${window.visualViewport.width}x${window.visualViewport.height}`,
              'visualviewport'
            );
          }
          updateMeasurements();
        });
      };

      window.visualViewport.addEventListener('resize', () =>
        scheduleViewportUpdate('resize')
      );
      window.visualViewport.addEventListener('scroll', () =>
        scheduleViewportUpdate('scroll')
      );
    }

    // ResizeObserver on document.documentElement
    let resizeTimeout;
    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce to prevent "ResizeObserver loop completed" errors
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          if (showResizeEvents) {
            addLog(
              `ResizeObserver: ${entry.contentRect.width}x${entry.contentRect.height}`,
              'resize-observer'
            );
          }
          updateMeasurements();
        }
      }, 0);
    });
    resizeObserver.observe(document.documentElement);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener(
          'change',
          handleScreenOrientationChange
        );
      }
      portraitMediaQuery.removeEventListener('change', handleMatchMediaChange);
      resizeObserver.disconnect();
    };
  });

  // CSS variables for safe area insets
  $effect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(
        '--safe-area-inset-top',
        `${safeAreaTop}px`
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-right',
        `${safeAreaRight}px`
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-bottom',
        `${safeAreaBottom}px`
      );
      document.documentElement.style.setProperty(
        '--safe-area-inset-left',
        `${safeAreaLeft}px`
      );
    }
  });
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<button onclick={()=>{location.reload();}}>Reload</button>

<div data-page class="p-20up">
  <h1 class="type-heading-h1 mb-20bt">iOS Viewport Test & Debug</h1>

  <!-- <div class="info-section mb-20up">
    <h2 class="type-heading-h2 mb-12bt">Device Info</h2>
    <div class="info-grid">
      <div class="info-item">
        <strong>PWA Mode:</strong>
        {isPwa ? 'Yes' : 'No'}
      </div>
      <div class="info-item">
        <strong>iOS Device:</strong>
        {isIos ? 'Yes' : 'No'}
      </div>
      <div class="info-item">
        <strong>User Agent:</strong>
        <span class="text-small">{navigator.userAgent}</span>
      </div>
    </div>
  </div> -->

  <div class="measurements-section mb-20up">
    <h2 class="type-heading-h2 mb-12bt">Live Measurements</h2>

    <h3 class="type-heading-h3 mb-8bt">Window (innerWidth/innerHeight)</h3>
    <div class="measurement-box mb-12up">
      <div class="measurement-large">{windowWidth} × {windowHeight}</div>
    </div>

    <h3 class="type-heading-h3 mb-8bt">Screen Dimensions</h3>
    <div class="info-grid mb-12up">
      <div class="info-item">
        <strong>screen.width × height:</strong>
        {screenWidth} × {screenHeight}
      </div>
      <div class="info-item">
        <strong>screen.availWidth × availHeight:</strong>
        {screenAvailWidth} × {screenAvailHeight}
      </div>
    </div>

    {#if typeof window !== 'undefined' && window.visualViewport}
      <h3 class="type-heading-h3 mb-8bt">
        Visual Viewport API (Most Accurate)
      </h3>
      <div class="info-grid mb-12up">
        <div class="info-item">
          <strong>width × height:</strong>
          {visualViewportWidth} × {visualViewportHeight}
        </div>
        <div class="info-item">
          <strong>offsetLeft × offsetTop:</strong>
          {visualViewportOffsetLeft} × {visualViewportOffsetTop}
        </div>
        <div class="info-item">
          <strong>scale:</strong>
          {visualViewportScale}
        </div>
      </div>
    {/if}

    {#if isPwa && isIos}
      <h3 class="type-heading-h3 mb-8bt">iOS PWA Calculated Dimensions</h3>
      <div class="info-grid mb-12up">
        <div class="info-item">
          <strong>iosWindowWidth × iosWindowHeight:</strong>
          {iosWindowWidth} × {iosWindowHeight}
        </div>
      </div>
    {/if}

    <h3 class="type-heading-h3 mb-8bt">Orientation</h3>
    <div class="info-grid mb-12up">
      <div class="info-item">
        <strong>matchMedia (most reliable):</strong>
        {orientation}
      </div>
      {#if typeof window !== 'undefined' && window.screen.orientation}
        <div class="info-item">
          <strong>screen.orientation.type:</strong>
          {screenOrientationType}
        </div>
        <div class="info-item">
          <strong>screen.orientation.angle:</strong>
          {screenOrientationAngle}°
        </div>
      {/if}
    </div>

    <h3 class="type-heading-h3 mb-8bt">Safe Area Insets</h3>
    <div class="info-grid mb-12up">
      <div class="info-item">
        <strong>Top:</strong>
        {safeAreaTop}px
      </div>
      <div class="info-item">
        <strong>Right:</strong>
        {safeAreaRight}px
      </div>
      <div class="info-item">
        <strong>Bottom:</strong>
        {safeAreaBottom}px
      </div>
      <div class="info-item">
        <strong>Left:</strong>
        {safeAreaLeft}px
      </div>
    </div>
  </div>

  <div class="controls-section mb-20up">
    <h2 class="type-heading-h2 mb-12bt">Event Logging Controls</h2>
    <div class="checkbox-grid">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showResizeEvents} />
        Window resize events
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showOrientationEvents} />
        Orientation change events
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showVisualViewportEvents} />
        Visual viewport events
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showScreenOrientationEvents} />
        Screen orientation events
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={showMatchMediaEvents} />
        matchMedia events
      </label>
    </div>
    <button class="btn-clear mt-12up" onclick={clearLog}>Clear Log</button>
  </div>

  <div class="log-section">
    <h2 class="type-heading-h2 mb-12bt">
      Event Log (latest {maxLogEntries})
    </h2>
    <div class="event-log">
      {#each eventLog as entry}
        <div class="log-entry log-{entry.category}">
          <span class="log-time">{entry.timestamp}</span>
          <span class="log-category">[{entry.category}]</span>
          <span class="log-message">{entry.message}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style src="./style.css"></style>
