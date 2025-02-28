<script>
  import { VirtualViewport } from '$lib/components/boxes/index.js';
  import { Button, TextButton } from '$lib/components/buttons/index.js';

  // Track viewport scaling values
  let viewportScaleViewport = $state(0);
  let viewportScaleW = $state(0);
  let viewportScaleH = $state(0);
  let viewportScaleUI = $state(0);
  let viewportScaleTextContent = $state(0);
  let viewportScaleTextHeading = $state(0);
  let viewportScaleTextUI = $state(0);

  // Reference to the container div
  let containerElement;

  // Define viewport presets
  const viewportPresets = [
    { name: 'sm', width: 640, height: 360, scale: 0.33 },
    { name: 'md', width: 768, height: 432, scale: 0.4 },
    { name: 'lg', width: 1024, height: 576, scale: 0.53 },
    { name: 'xl', width: 1280, height: 720, scale: 0.67 },
    { name: '2xl', width: 1536, height: 864, scale: 0.8 }
  ];

  // Apply preset size to the container
  function applyViewportSize(width, height) {
    if (!containerElement) return;

    containerElement.style.width = `${width}px`;
    containerElement.style.height = `${height}px`;
  }

  const designWidth = 1024;
  const designHeight = 576;
</script>

<div class="flex flex-col gap-6 p-6">
  <div class="flex flex-wrap gap-4 mb-4">
    {#each viewportPresets as preset}
      <TextButton
        role="secondary"
        size="sm"
        onclick={() => applyViewportSize(preset.width, preset.height)}
      >
        {preset.name}
      </TextButton>
    {/each}
  </div>

  <div
    bind:this={containerElement}
    style:width={designWidth + 2 + 'px'}
    style:height={designHeight + 2 + 'px'}
    class="border-1 border-primary-500 resize overflow-hidden"
  >
    <!-- Viewport with all text scales -->
    <VirtualViewport
      {designWidth}
      {designHeight}
      bind:scaleViewport={viewportScaleViewport}
      bind:scaleW={viewportScaleW}
      bind:scaleH={viewportScaleH}
      bind:scaleUI={viewportScaleUI}
      bind:scaleTextContent={viewportScaleTextContent}
      bind:scaleTextHeading={viewportScaleTextHeading}
      bind:scaleTextUI={viewportScaleTextUI}
      class="p-20p"
    >
      <!-- <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col items-start gap-2">
          <Button role="primary" data-size="sm">Primary</Button>
          <Button role="primary" data-size="md">Primary</Button>
          <Button role="primary" data-size="lg">Primary</Button>
        </div>

        <div class="flex flex-col items-start gap-2">
          <Button role="secondary" data-size="sm">Secondary</Button>
          <Button role="secondary" data-size="md">Secondary</Button>
          <Button role="secondary" data-size="lg">Secondary</Button>
        </div>
      </div>

      <br />
      <hr />
      <br /> -->

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col items-start gap-2">
          <TextButton role="primary" data-size="sm">Primary</TextButton>
          <TextButton role="primary" data-size="md">Primary</TextButton>
          <TextButton role="primary" data-size="lg">Primary</TextButton>
        </div>

        <div class="flex flex-col items-start gap-2">
          <TextButton role="secondary" data-size="sm">Secondary</TextButton>
          <TextButton role="secondary" data-size="md">Secondary</TextButton>
          <TextButton role="secondary" data-size="lg">Secondary</TextButton>
        </div>
      </div>

      <br />
      <hr />
      <br />

      <div class="p-20p">
        <!-- Heading text samples -->
        <div class="mb-10p">
          <h1 class="text-heading-h1 mb-10p">Heading 1 - Large Title</h1>
          <h2 class="text-heading-h2 mb-10p">Heading 2 - Section Title</h2>
          <h3 class="text-heading-h3 mb-10p">Heading 3 - Subsection Title</h3>
          <h4 class="text-heading-h4 mb-10p">Heading 4 - Minor Heading</h4>
          <h5 class="text-heading-h5 mb-20p">Heading 5 - Small Heading</h5>
        </div>

        <!-- Content text samples -->
        <div class="mb-20p">
          <p class="text-content-sm mb-10p">
            Small content text - Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </p>
          <p class="text-content-base mb-10p">
            Base content text - Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </p>
          <p class="text-content-lg mb-20p">
            Large content text - Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </p>
        </div>

        <!-- UI text in buttons -->
        <!-- <div class="flex gap-10p">
          <button
            class="bg-primary-100 p-10p rounded-sm border-width-thin text-ui-sm"
          >
            Small UI Text
          </button>
          <button
            class="bg-primary-200 p-15p rounded-md border-width-normal text-ui-base"
          >
            Base UI Text
          </button>
          <button
            class="bg-primary-300 p-20p rounded-lg border-width-thick text-ui-lg"
          >
            Large UI Text
          </button>
        </div> -->

        <!-- Viewport points demo -->
        <div class="mt-30p flex gap-10p">
          <div
            class="w-100wp h-100wp bg-secondary-500 flex items-center justify-center text-white text-ui-base"
          >
            100wp
          </div>
          <div
            class="w-100vp h-100vp bg-tertiary-500 flex items-center justify-center text-white text-ui-base"
          >
            100vp
          </div>
          <div
            class="w-100p h-100p bg-success-500 flex items-center justify-center text-white text-ui-base"
          >
            100p
          </div>
        </div>
      </div>
    </VirtualViewport>
  </div>

  <!-- Scale info display -->
  <div class="bg-gray-100 p-10p">
    <h2 class="text-xl font-bold mb-2ut">Virtual Viewport Scaling Values</h2>
    <div class="grid grid-cols-2 gap-2ut">
      <div>
        <p>
          <strong>Scale Viewport:</strong>
          {viewportScaleViewport.toFixed(4)}
        </p>
        <p><strong>Scale W:</strong> {viewportScaleW.toFixed(4)}</p>
        <p><strong>Scale H:</strong> {viewportScaleH.toFixed(4)}</p>
        <p><strong>Scale UI:</strong> {viewportScaleUI.toFixed(4)}</p>
      </div>
      <div>
        <p>
          <strong>Scale Text Content:</strong>
          {viewportScaleTextContent.toFixed(4)}
        </p>
        <p>
          <strong>Scale Text Heading:</strong>
          {viewportScaleTextHeading.toFixed(4)}
        </p>
        <p><strong>Scale Text UI:</strong> {viewportScaleTextUI.toFixed(4)}</p>
      </div>
    </div>
  </div>
</div>
