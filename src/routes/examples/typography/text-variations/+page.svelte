<script>
  import { page } from '$app/stores';
</script>

<div class="container mx-auto p-8 space-y-8">
  <section>
    <h1
      class="text-4xl font-heading text-surface-900 dark:text-surface-50 mb-4"
    >
      Typography test page
    </h1>

    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-heading-h2 mb-4">Headings</h2>

        <div class="space-y-4">
          <h1 class="text-heading-h1 font-heading">H1 Heading (Guyot-Sans)</h1>
          <h2 class="text-heading-h2 font-heading">H2 Heading (Guyot-Sans)</h2>
          <h3 class="text-heading-h3 font-heading">H3 Heading (Guyot-Sans)</h3>
          <h4 class="text-heading-h4 font-heading">H4 Heading (Guyot-Sans)</h4>
          <h5 class="text-heading-h5 font-heading">H5 Heading (Guyot-Sans)</h5>
        </div>
      </div>

      <div>
        <h2 class="text-heading-h2 mb-4">Base text variations</h2>

        <div class="space-y-4">
          <p class="text-base-sm font-base">Small Base Text (Mulish)</p>
          <p class="text-base-md font-base">Medium Base Text (Mulish)</p>
          <p class="text-base-lg font-base">Large Base Text (Mulish)</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-heading-h2 mb-4">UI text variations</h2>

    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h3 class="text-heading-h3 mb-4">UI text styles</h3>

        <div class="space-y-4">
          <p class="text-ui-sm font-ui">Small UI Text (Source Sans Pro)</p>
          <p class="text-ui-md font-ui">Medium UI Text (Source Sans Pro)</p>
          <p class="text-ui-lg font-ui">Large UI Text (Source Sans Pro)</p>
        </div>
      </div>

      <div>
        <h3 class="text-heading-h3 mb-4">Color variations</h3>

        <div class="py-20up">
          <p class="text-primary-500">Primary color text</p>
          <p class="text-secondary-500">Secondary color text</p>
          <p class="text-tertiary-500">Tertiary color text</p>
        </div>

        <div class="py-20up">
          <p class="text-heading-color">Heading color</p>
          <p class="text-base-color">Base text color</p>
          <p class="ui-base-color">UI text color</p>
        </div>
        <div class="py-20up bg-surface-950">
          <p class="text-heading-color-dark">Heading color dark</p>
          <p class="text-base-color-dark">Base text color dark</p>
          <p class="text-ui-color-dark">UI text color dark</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-heading-h2 mb-4">Dark Mode Demonstration</h2>

    <div class="bg-surface-100 dark:bg-surface-900 p-6 rounded-lg">
      <p class="text-base-md text-surface-900 dark:text-surface-50">
        This text demonstrates color adaptation in dark mode.
      </p>
      <p class="text-ui text-ui-dark">
        UI text also adapts to dark mode styling.
      </p>
    </div>
  </section>
</div>
