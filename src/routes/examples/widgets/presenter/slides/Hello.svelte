<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import { SLIDE_WORLD } from '../slides.js';

  /**
   * @type {{
   *   title?: string,
   *   subtitle?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   * }}
   */
  let { title, subtitle, presenter, getLoadingController } = $props();

  // Navigation using the presenter reference
  function goToNextSlide() {
    if (presenter) {
      presenter.gotoSlide(SLIDE_WORLD);
    }
  }
</script>

<div
  class="flex flex-col items-center justify-center h-full w-full bg-surface-50 text-surface-950"
>
  <div class="p-40up">
    <h3 class="text-heading-h3 font-heading mb-16ht">{title}</h3>
    <p class="text-base-md font-base mb-8bt">{subtitle}</p>

    <p class="text-base-md font-base mb-30up">
      Click the button below to continue to the next slide.
    </p>

    <TextButton role="primary" onclick={goToNextSlide}>Next</TextButton>
  </div>
</div>
