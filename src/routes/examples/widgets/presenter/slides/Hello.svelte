<script>
  import ElectricBlue from '../../../assets/images/electric-blue.jpg?preset=gradient&responsive';

  import { GridLayers } from '$lib/components/layout/index.js';

  import { ImageBox } from '$lib/widgets/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  import { SLIDE_WORLD } from '../config/labels.js';

  /**
   * @type {{
   *   title?: string,
   *   subtitle?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   * }}
   */
  let { title = 'Title', subtitle = 'Subtitle', presenter } = $props();

  function goToNextSlide() {
    if (presenter) {
      presenter.gotoSlide(SLIDE_WORLD);
    }
  }
</script>

<div class="absolute inset-0">
  <ImageBox imageMeta={ElectricBlue} fit="cover" position="center center" />
</div>

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
