<script>
  import ElectricBlue from '$examples/assets/images/electric-blue.jpg?preset=gradient&responsive';

  import { GridLayers } from '$lib/ui/components.js';

  import { ImageBox } from '$lib/ui/components/index.js';

  import { TextButton } from '$lib/ui/primitives/buttons/index.js';

  import { SLIDE_WORLD } from '../config/labels.js';

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
      presenter.gotoSlide(SLIDE_WORLD);
    }
  }

  //
  // Using the loading controller is optional,
  // disabled for this slide by
  // - not calling getLoadingController
  // - setting show=true
  // - empty progressListener
  //
  let show = $state(true);

  // const controller = getLoadingController?.();

  function progressListener(progress, id) {
    // console.log('loadingProgress', { ...progress, id });
    // if (progress.loaded) {
    //   show = true;
    //   controller?.loaded();
    //   console.log('Show');
    // }
  }

</script>

<div class="justify-self-stretch self-stretch grid">
  <ImageBox
    imageSource={ElectricBlue}
    fit="cover"
    position="center center"
    onProgress={progressListener}
  />
</div>

{#if show}
  <div class="justify-self-stretch self-stretch grid">
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
