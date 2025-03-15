<script>
  import { onMount } from 'svelte';

  import ElectricBlue from '../../../assets/images/electric-blue.jpg?preset=gradient&responsive';

  import { ImageBox } from '$lib/widgets/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  import { SLIDE_HELLO } from '../config/labels.js';

  import GridLayers from '$lib/components/layout/grid-layers/GridLayers.svelte';

  /**
   * @type {{
   *   title?: string,
   *   subtitle?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   * }}
   */
  let {
    title = 'Title',
    subtitle = 'Subtitle',
    presenter,
    getLoadingController
  } = $props();

  function goToNextSlide() {
    if (presenter) {
      presenter.gotoSlide(SLIDE_HELLO);
    }
  }

  // Helper function to delay execution
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  console.debug('Contructor World');

  let show = $state(false);

  let controller;

  onMount(() => {
    console.debug('World Mounted');
    controller = getLoadingController?.();
  });

  async function progressListener(progress, id) {
    // console.log('loadingProgress', { ...progress, id });
    if (progress.loaded && !show) {
      await delay(1500);
      show = true;
      console.log('controller', controller);
      controller?.loaded();
      console.log('show');
    }
  }
</script>

<div class="absolute inset-0" class:invisible={!show}>
  <ImageBox
    imageMeta={ElectricBlue}
    fit="cover"
    position="center center"
    onProgress={progressListener}
  />
</div>

{#if show}
  <div class="absolute inset-0">
    <div class="p-40up">
      <h3 class="text-heading-h3 font-heading mb-16ht">{title}</h3>
      <p class="text-base-md font-base mb-8bt">{subtitle}</p>

      <p class="text-base-md font-base mb-30up">
        Click the button below to continue to the next slide.
      </p>

      <TextButton role="primary" onclick={goToNextSlide}>Next</TextButton>
    </div>
  </div>
{/if}

<!-- <div
  class="flex flex-col items-center justify-center h-full w-full bg-blue-600 text-white"
>
  {#if isLoading}
    <div class="text-center">
      <div
        class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-middle"
      ></div>
      <p class="mt-4">Loading slide content...</p>
    </div>
  {:else}
    <div class="z-0">
      <ImageBox imageMeta={ElectricBlue} fit="cover" position="center center" />
    </div>

    <div class="p-8 text-center z-1">
      <h1 class="text-heading-h1 font-heading mb-4">{title}</h1>
      <p class="text-base-lg mb-8">{subtitle}</p>

      <div class="max-w-lg mx-auto mb-8">
        <p class="mb-4">
          This is the blue World slide with full-size background.
        </p>
        <p>You can go back to the first slide if you want.</p>
      </div>

      <TextButton role="primary" onclick={goBack}>← Back to Hello</TextButton>
    </div>
  {/if}
</div> -->
