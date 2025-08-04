<script>
  import { TextButton } from '$lib/ui/primitives/buttons/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Default</h5>

  <div class="py-20up">
    <TextButton
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</TextButton
    >

    <TextButton
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</TextButton
    >
  </div>

  <h5 class="text-heading-h5 heading-font-family pt-10up">Disabled</h5>

  <div class="py-20up">
    <TextButton
      disabled
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</TextButton
    >

    <TextButton
      disabled
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</TextButton
    >
  </div>

  <h5 class="text-heading-h5 heading-font-family pt-10up">Full width</h5>

  <div class="py-20up">
    <div class="p-10up w-[400px] border-width-thin border-black">
      <TextButton
        classes="w-full"
        role="primary"
        onclick={() => {
          console.log('Primary clicked');
        }}>Primary</TextButton
      >
    </div>
  </div>
</div>
