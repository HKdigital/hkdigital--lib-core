<script>
  import { onMount, onDestroy } from 'svelte';
  import { ImageBox } from '$lib/widgets/index.js';
  import LoadingIndicator from './LoadingIndicator.svelte';
  import { loading } from '$lib/util/svelte/index.js';
  import { ArmyGreen, ElectricBlue } from '../../../assets/images.js';

  // Track loading state
  let imagesLoaded = $state(false);
  let debugInfo = $state('Waiting for images...');

  // Create a custom progress handler with debug logging
  const progressHandler = (progress, id) => {
    // Debug: Log every progress update
    const progressInfo = JSON.stringify({
      id: id?.toString() || 'unknown',
      bytesLoaded: progress.bytesLoaded,
      size: progress.size,
      loaded: progress.loaded
    });

    debugInfo = `Last update: ${progressInfo}`;
    console.log(`Progress update:`, progressInfo);

    // Store progress in tracker
    loadingTracker.track(progress, id);

    // Check loading state manually after each update
    const trackerState = loadingTracker.state;
    console.log(`Tracker state:`, {
      itemCount: trackerState.itemCount,
      allLoaded: trackerState.loaded,
      percent: trackerState.percent
    });

    // Force check loading status
    if (trackerState.itemCount > 0 && trackerState.loaded) {
      console.log('🎉 All images loaded!');
      imagesLoaded = true;
      debugInfo = `All loaded! Items: ${trackerState.itemCount}, Loaded: ${trackerState.loaded}`;
    }
  };

  // Create a loading tracker instance
  const loadingTracker = loading.createTracker();

  // Add cleanup on component destroy
  onDestroy(() => {
    loadingTracker.reset();
  });

  // Try a manual check after component mount
  onMount(() => {
    // Safety check after 3 seconds to see if images loaded
    setTimeout(() => {
      const state = loadingTracker.state;
      debugInfo = `Safety check: Items: ${state.itemCount}, Loaded: ${state.loaded}, Percent: ${state.percent}%`;

      // Force recheck loading status
      if (state.itemCount > 0 && state.loaded && !imagesLoaded) {
        console.log('🔄 Safety check: Forcing loaded state!');
        imagesLoaded = true;
      }
    }, 3000);
  });
</script>

<!-- Debug info -->
<div
  class="fixed top-0 left-0 right-0 bg-surface-900 text-surface-50 p-8up z-[100]"
>
  <p class="text-base-sm font-mono">{debugInfo}</p>
  <div class="flex gap-4up mt-4bt">
    <button
      class="px-4up py-2up bg-primary-600 rounded-md text-white"
      onclick={() => {
        imagesLoaded = true;
      }}
    >
      Force Hide Loader
    </button>
    <button
      class="px-4up py-2up bg-warning-600 rounded-md text-white"
      onclick={() => {
        const state = loadingTracker.state;
        debugInfo = `Manual check: Items: ${state.itemCount}, Loaded: ${state.loaded}, Percent: ${state.percent}%`;
      }}
    >
      Check Tracker
    </button>
  </div>
</div>

<!-- Loading indicator -->
{#if !imagesLoaded}
  <LoadingIndicator
    percent={loadingTracker.percent}
    bytesLoaded={loadingTracker.state.bytesLoaded}
    totalBytes={loadingTracker.state.size}
    showBytes={true}
    title="Loading Images"
  />
{/if}

<!-- Images container with margin top to account for debug panel -->
<div
  class="grid grid-cols-1 md:grid-cols-2 gap-16up mt-[100px] {imagesLoaded
    ? 'opacity-100'
    : 'opacity-0'} transition-opacity duration-500"
>
  <!-- First image -->
  <div class="p-16up">
    <h2 class="text-heading-h3 font-heading mb-8ht">Army Green</h2>
    <ImageBox
      id="armyGreen"
      imageMeta={ArmyGreen}
      fit="contain"
      position="center center"
      height="h-[300px]"
      classes="w-full border-2 border-surface-300 rounded-md"
      onProgress={progressHandler}
      bg="bg-surface-200"
    />
  </div>

  <!-- Second image -->
  <div class="p-16up">
    <h2 class="text-heading-h3 font-heading mb-8ht">Electric Blue</h2>
    <ImageBox
      id="electricBlue"
      imageMeta={ElectricBlue}
      fit="contain"
      position="center center"
      height="h-[300px]"
      classes="w-full border-2 border-surface-300 rounded-md"
      onProgress={progressHandler}
      bg="bg-surface-200"
    />
  </div>
</div>
