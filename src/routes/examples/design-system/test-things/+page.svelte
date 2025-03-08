<script>
  import { Button, TextButton } from '$lib/components/buttons/index.js';
</script>

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

<div class="grid grid-cols-2 gap-4 p-20p">
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

<hr />

<div class="grid grid-cols-2 gap-4 p-20p">
  <div class="flex flex-col items-start gap-2">
    <TextButton role="primary" active>Active</TextButton>
    <TextButton role="primary" selected>Selected</TextButton>
    <TextButton role="primary" loading>Loading</TextButton>
    <TextButton role="primary" error>Error</TextButton>
    <TextButton role="primary" disabled>Disabled</TextButton>
  </div>

  <div class="flex flex-col items-start gap-2">
    <TextButton role="secondary" active>Active</TextButton>
    <TextButton role="secondary" selected>Selected</TextButton>
    <TextButton role="secondary" loading>Loading</TextButton>
    <TextButton role="secondary" error>Error</TextButton>
    <TextButton role="secondary" disabled>Disabled</TextButton>
  </div>
</div>

<hr />

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
      Small content text - Lorem ipsum dolor sit amet, consectetur adipiscing
      elit.
    </p>
    <p class="text-base-md mb-10p">
      Base content text - Lorem ipsum dolor sit amet, consectetur adipiscing
      elit.
    </p>
    <p class="text-content-lg mb-20p">
      Large content text - Lorem ipsum dolor sit amet, consectetur adipiscing
      elit.
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
            class="bg-primary-200 p-15p rounded-md border-width-normal text-ui-md"
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
      class="w-100wp h-100wp bg-secondary-500 flex items-center justify-center text-white text-ui-md"
    >
      100wp
    </div>
    <div
      class="w-100vp h-100vp bg-tertiary-500 flex items-center justify-center text-white text-ui-md"
    >
      100vp
    </div>
    <div
      class="w-100p h-100p bg-success-500 flex items-center justify-center text-white text-ui-md"
    >
      100p
    </div>
  </div>
</div>
