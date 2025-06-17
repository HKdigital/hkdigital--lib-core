<script>
  import { GridLayers } from '$lib/components/layout/index.js';

  let contentHeight = $state(100);

  function toggleHeight() {
    contentHeight = contentHeight === 100 ? 300 : 100;
  }
</script>

<!-- <div class="p-20up">
  <h2 class="type-header-h3 mb-4">Fixed height example (reference)</h2>
  <GridLayers classes="border border-gray-300 w-full max-w-lg h-[200px]">
    <div class="justify-self-center self-center">
      <div class="bg-primary-500 text-white p-4 rounded">
        <span class="type-base-md">Fixed height container</span>
      </div>
    </div>
  </GridLayers>
</div> -->

<div class="p-20up">
  <h2 class="type-header-h3 mb-4">Dynamic height example</h2>
  <GridLayers classes="border border-gray-300 w-full max-w-lg">
    <div data-layer="header" class="justify-self-center self-start z-10">
      <div class="bg-primary-500 text-white p-4 w-full text-center">
        <span class="type-base-md">Header</span>
      </div>
    </div>

    <div data-layer="content" class="justify-self-center self-center z-0">
      <div class="bg-secondary-500 text-white p-8 rounded my-8">
        <span class="type-base-md">This layer controls the height of the container</span>
      </div>
    </div>

    <div data-layer="footer" class="justify-self-center self-end">
      <div class="bg-tertiary-500 text-white p-4 w-full text-center">
        <span class="type-base-md">Footer</span>
      </div>
    </div>
  </GridLayers>
</div>

<div class="p-20up">
  <h2 class="type-header-h3 mb-4">Interactive example</h2>

  <div class="mb-4">
    <button
      class="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded"
      onclick={toggleHeight}
    >
      <span class="type-base-md">Toggle height</span>
    </button>
  </div>

  <GridLayers classes="border border-gray-300 w-full max-w-lg">
    <div data-layer="dynamic-content" class="justify-self-center self-center p-8 m-8 border-8">
      <div
        class="bg-secondary-500 text-white p-4 rounded my-4 transition-all duration-300 ease-in-out"
        style:height="{contentHeight}px"
        style:width="200px"
      >
        <span class="type-base-md">Content</span>
      </div>
    </div>
    <div data-layer="header" class="justify-self-center self-start">
      <div class="bg-error-500 text-white p-4 w-full text-center">
        <span class="type-base-md">Header</span>
      </div>
    </div>
    <div data-layer="footer" class="justify-self-center self-end">
      <div class="bg-surface-500 text-white p-4 w-full text-center">
        <span class="type-base-md">Footer</span>
      </div>
    </div>
  </GridLayers>
</div>
