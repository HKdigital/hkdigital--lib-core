<!-- +page.svelte -->
<script>
  import { CompareLeftRight } from '$lib/components/widgets/compare-left-right/index.js';

  import ArmyGreen from '../assets/img/army-green.jpg?raw';

  import ElectricBlue from '../assets/img/electric-blue.jpg?raw';
</script>


<div class="container h-full min-h-screen mx-auto p-4 space-y-8">
  <h1 class="h1">Content Comparison Examples</h1>

  <!-- Image comparison -->
  <section class="pt-10 space-y-5  h-[600px]">
    <h2 class="h2">Image Comparison</h2>
    <div class="h-full">
      <CompareLeftRight classes="h-full rounded-lg border border-surface-300">
        {#snippet leftContent()}
          <img
            src={ArmyGreen}
            alt="Landscape before editing"
            class="h-full w-full object-cover"
          />
        {/snippet}

        {#snippet rightContent()}
          <img
            src={ElectricBlue}
            alt="Landscape after editing"
            class="h-full w-full object-cover"
          />
        {/snippet}
      </CompareLeftRight>
    </div>
  </section>

  <!-- Text comparison -->
  <section class="pt-10 space-y-5 h-[400px]">
    <h2 class="h2">Text Comparison</h2>
    <div class="h-full">
      <CompareLeftRight
        classes="h-full rounded-lg border border-surface-300"
        dividerColor="bg-primary-500"
        handleColor="bg-primary-700"
      >
        {#snippet leftContent()}
          <div class="h-full w-full p-4 bg-surface-100 overflow-auto">
            <h3 class="h3 mb-2">Contract Version 1</h3>
            <p>
              The party of the first part hereby agrees to deliver the specified goods
              within 30 days of receipt of payment. All deliveries will be made during
              normal business hours, Monday through Friday.
            </p>
          </div>
        {/snippet}

        {#snippet rightContent()}
          <div class="h-full w-full p-4 bg-surface-50 overflow-auto">
            <h3 class="h3 mb-2">Contract Version 2</h3>
            <p>
              The party of the first part hereby agrees to deliver the specified goods
              within 14 days of receipt of payment. All deliveries will be made during
              extended business hours, Monday through Saturday.
            </p>
          </div>
        {/snippet}
      </CompareLeftRight>
    </div>
  </section>
</div>
