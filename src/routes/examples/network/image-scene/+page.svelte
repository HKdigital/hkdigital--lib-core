<script>
  import { onMount, untrack } from 'svelte';

  import { ArmyGreen, ElectricBlue } from '$examples/assets/images.js';

  import { ImageBox } from '$lib/ui/components.js';

  import { ImageScene } from '$lib/network/loaders.js';

  const ARMY_GREEN = 'army-green';
  const ELECTRIC_BLUE = 'electric-blue';

  /** @type {ImageScene|null} */
  let imageScene = $state(null);

  /** @type {string} */
  let loadingStatus = $state('Not started');
  
  /** @type {object|null} */
  let progress = $state(null);
  
  /** @type {Error|null} */
  let error = $state(null);

  onMount(async () => {
    console.log('ArmyGreen', ArmyGreen);
    console.log('ElectricBlue', ElectricBlue);

    //
    // Create image scene, define images and test preloading
    //
    if (!imageScene) {
      imageScene = new ImageScene();

      // Define image sources
      imageScene.defineImage({ label: ARMY_GREEN, imageSource: ArmyGreen });
      imageScene.defineImage({ label: ELECTRIC_BLUE, imageSource: ElectricBlue });

      // Test preload with progress tracking
      loadingStatus = 'Starting preload...';
      
      try {
        const { promise, abort } = imageScene.preload({
          timeoutMs: 10000,
          onProgress: (progressData) => {
            progress = progressData;
            console.log('Preload progress:', progressData);
          }
        });

        loadingStatus = 'Preloading...';
        const result = await promise;
        
        // Update progress one final time with actual scene progress
        progress = imageScene.progress;
        loadingStatus = 'Preload complete!';
        console.log('Preload successful:', result);
        
      } catch (err) {
        error = err;
        loadingStatus = `Preload failed: ${err.message}`;
        console.error('Preload error:', err);
      }
    }
  });

  $effect(() => {
    //
    // Debug: image scene loaded
    //
    if (imageScene?.loaded) {
      console.log('Scene loaded!');
    }
  });

  $effect(() => {
    //
    // Debug image scene progress
    //
    if (imageScene?.progress) {
      console.log('Progress', imageScene?.progress);
    }
  });

  // svelte-ignore non_reactive_update
  let armyGreenUrl;

  // svelte-ignore non_reactive_update
  let electricBlueUrl;

  $effect(() => {
    //
    // Update and destroy object url's in test width plain IMG elements
    //
    if (imageScene?.loaded) {
      armyGreenUrl = imageScene.getObjectURL(ARMY_GREEN);
      electricBlueUrl = imageScene.getObjectURL(ELECTRIC_BLUE);
    }

    return () => {
      if (armyGreenUrl) {
        URL.revokeObjectURL(armyGreenUrl);
        armyGreenUrl = undefined;
      }

      if (electricBlueUrl) {
        URL.revokeObjectURL(electricBlueUrl);
        electricBlueUrl = undefined;
      }
    };
  });
</script>

<div class="container mx-auto p-20up" data-page>
  <h1 class="type-heading-h1 mb-20up">Image Scene Preload Test</h1>
  
  <!-- Loading Status -->
  <div class="card p-20up mb-20up">
    <h2 class="type-heading-h2 mb-12bt">Loading Status</h2>
    <p class="type-base-md mb-12bt">Status: <strong>{loadingStatus}</strong></p>
    
    {#if progress}
      <div class="mb-12bt">
        <p class="type-base-sm">Progress: {progress.sourcesLoaded}/{progress.numberOfSources} sources loaded</p>
        <p class="type-base-sm">Data: {progress.totalBytesLoaded.toLocaleString()} / {progress.totalSize.toLocaleString()} bytes</p>
        {#if progress.sourcesLoaded === progress.numberOfSources && progress.numberOfSources > 0}
          <p class="type-base-sm text-success-600">✓ All sources loaded successfully</p>
        {/if}
      </div>
    {/if}
    
    {#if error}
      <div class="bg-error-100 border border-error-500 p-10up rounded">
        <p class="type-base-sm text-error-700">Error: {error.message}</p>
      </div>
    {/if}
  </div>

  <!-- Images -->
  {#if imageScene?.loaded}
    <div class="card p-20up mb-20up">
      <h2 class="type-heading-h2 mb-12bt">Loaded Images</h2>
      <div class="flex gap-20up">
        <ImageBox
          imageLoader={imageScene.getImageLoader(ARMY_GREEN)}
          fit="contain"
          position="center center"
          width="w-[200px]"
          height="h-[200px]"
          classes="border-4 border-primary-500"
        />

        <ImageBox
          imageLoader={imageScene.getImageLoader(ELECTRIC_BLUE)}
          fit="contain"
          position="center center"
          width="w-[200px]"
          height="h-[200px]"
          classes="border-4 border-primary-500"
        />
      </div>
    </div>
  {/if}

  <!-- Alternative: Raw Image URLs (for testing) -->
  {#if imageScene?.loaded}
    <div class="card p-20up">
      <h2 class="type-heading-h2 mb-12bt">Raw Image URLs</h2>
      <div class="flex gap-20up">
        {#if armyGreenUrl}
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={armyGreenUrl} width="200px" class="border-2 border-surface-300" />
        {/if}
        {#if electricBlueUrl}
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={electricBlueUrl} width="200px" class="border-2 border-surface-300" />
        {/if}
      </div>
    </div>
  {/if}
</div>
