<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import { createOrGetPresenterState } from '$lib/widgets/presenter/index.js';
  import { SLIDE_HELLO } from '../slides.js';

  // Props passed from slide configuration
  /** @type {{title?: string, subtitle?: string}} */
  export let title = 'Default Title';
  export let subtitle = '';

  // Get presenter state
  const presenter = createOrGetPresenterState();

  // Navigate to previous slide
  function goBack() {
    presenter.gotoSlide(SLIDE_HELLO);
  }
</script>

<div
  class="flex flex-col items-center justify-center h-full w-full bg-surface-950 text-surface-50"
>
  <div class="p-40up">
    <h3 class="text-heading-h3 font-heading mb-16ht">{title}</h3>
    <p class="text-base-md font-base mb-8bt">{subtitle}</p>

    <p class="text-base-md font-base mb-30up">
      Click the button below to continue to the previous slide.
    </p>

    <TextButton role="primary" onclick={goBack}>Back</TextButton>
  </div>
</div>
