<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import { createOrGetPresenterState } from '$lib/widgets/presenter/index.js';
  import { SLIDE_WORLD } from '../slides.js';

  // Props passed from slide configuration
  /** @type {{title?: string, subtitle?: string}} */
  const { title, subtitle } = $props();

  // Get presenter state
  const presenter = createOrGetPresenterState();

  // Navigate to next slide
  function goToNext() {
    presenter.gotoSlide(SLIDE_WORLD);
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

    <TextButton role="primary" onclick={goToNext}>Next</TextButton>
  </div>
</div>
