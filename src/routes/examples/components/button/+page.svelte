<script>
  import { Button } from '$lib/primitives/buttons/index.js';
</script>

<div class="p-20up">
  <h5 class="text-heading-h5 heading-font-family pt-10up">Default</h5>

  <div class="py-20up">
    <Button
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</Button
    >

    <Button
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</Button
    >
  </div>

  <h5 class="text-heading-h5 heading-font-family pt-10up">Disabled</h5>

  <div class="py-20up">
    <Button
      disabled
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</Button
    >

    <Button
      disabled
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</Button
    >
  </div>
</div>
