<script>
  import { onMount, onDestroy } from 'svelte';
  import { ImageBox } from '$lib/widgets/index.js';
  import { ArmyGreen, ElectricBlue } from '../../assets/images.js';
  import ImageScene from '$lib/classes/svelte/image/ImageScene.svelte';

  // Image labels as constants for better maintainability
  const ARMY_GREEN = 'army-green';
  const ELECTRIC_BLUE = 'electric-blue';

  // Create and configure the image scene
  let imageScene = $state(new ImageScene());

  // Loading state
  let loadingProgress = $state(0);

  // Set up the scene when component mounts
  onMount(() => {
    // Define images that will be used in the scene
    imageScene.defineImage({ label: ARMY_GREEN, imageMeta: ArmyGreen });
    imageScene.defineImage({ label: ELECTRIC_BLUE, imageMeta: ElectricBlue });

    // Start loading all images
    imageScene.load();
  });

  // Clean up when component is destroyed
  onDestroy(() => {
    if (imageScene) {
      imageScene.unload();
    }
  });

  // Track loading progress
  $effect(() => {
    if (imageScene?.progress) {
      const { bytesLoaded, size } = imageScene.progress;
      if (size > 0) {
        loadingProgress = Math.round((bytesLoaded / size) * 100);
      }
    }
  });
</script>

<!-- Loading indicator shown while images are being loaded -->
{#if !imageScene.loaded}
  <div
    class="fixed inset-0 flex items-center justify-center bg-surface-950/80 z-50 text-white"
  >
    <div class="bg-surface-800 p-20up rounded-md text-center">
      <h2 class="text-heading-h2 font-heading mb-8ht">Loading Images</h2>
      <div
        class="w-[200px] h-[10px] bg-surface-600 rounded-full overflow-hidden mb-8bt"
      >
        <div
          class="h-full bg-primary-500 transition-all duration-200"
          style:width="{loadingProgress}%"
        ></div>
      </div>
      <p class="text-base-md">{loadingProgress}%</p>
    </div>
  </div>
{/if}

<!-- Main content shown when images are loaded -->
<div
  class="{imageScene.loaded
    ? 'opacity-100'
    : 'opacity-0'} transition-opacity duration-500"
>
  <div class="p-20up flex flex-col md:flex-row gap-20up">
    <!-- First image -->
    <div class="w-full md:w-1/2">
      <h3 class="text-heading-h3 font-heading mb-8ht">Army Green</h3>
      {#if imageScene.loaded}
        <ImageBox
          imageLoader={imageScene.getImageLoader(ARMY_GREEN)}
          fit="cover"
          position="center center"
          height="h-[300px]"
          classes="border-4 border-green-500"
        />
      {/if}
    </div>

    <!-- Second image -->
    <div class="w-full md:w-1/2">
      <h3 class="text-heading-h3 font-heading mb-8ht">Electric Blue</h3>
      {#if imageScene.loaded}
        <ImageBox
          imageLoader={imageScene.getImageLoader(ELECTRIC_BLUE)}
          fit="cover"
          position="center center"
          height="h-[300px]"
          classes="border-4 border-blue-500"
        />
      {/if}
    </div>
  </div>
</div>
