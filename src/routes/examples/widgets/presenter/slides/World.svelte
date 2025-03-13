<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import { SLIDE_HELLO } from '../slides.js';

  /**
   * @type {{
   *   title?: string,
   *   subtitle?: string,
   *   presenter?: { gotoSlide: (name: string) => void, getCurrentSlideName: () => string },
   *   getLoadingController?: () => { loaded: () => void, cancel: () => void }
   * }}
   */
  let { title, subtitle, presenter, getLoadingController } = $props();

  // Navigate to previous slide
  function goBack() {
    presenter.gotoSlide(SLIDE_HELLO);
  }

  // Loading state
  let isLoading = $state(true);

  // Helper function to delay execution
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Handle loading process
  async function handleLoading() {
    if (getLoadingController) {
      const controller = getLoadingController();

      try {
        // Simulate loading process
        await delay(500);

        // Update local loading state
        isLoading = false;

        // Signal to the presenter that loading is complete
        controller.loaded();
      } catch (error) {
        console.error('Failed to load slide content', error);
        controller.cancel(); // Return to previous slide on error
      }
    } else {
      // If no controller is available, just update local state
      isLoading = false;
    }
  }

  // Start loading process immediately
  handleLoading();
</script>

<div
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
    <div class="p-8 text-center">
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
</div>
