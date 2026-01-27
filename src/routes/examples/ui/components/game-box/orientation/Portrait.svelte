<script>
  import { onMount } from "svelte";

  onMount( () => {
    console.debug('Mounted portrait');
  } );

  let widthPortrait = $state(0);
  let heightPortrait = $state(0);

</script>

<div class="p-20up w-full h-full" bind:clientWidth={widthPortrait} bind:clientHeight={heightPortrait}>
  <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
    On portrait [{widthPortrait}x{heightPortrait}]
  </h3>
  <div class="w-100up h-100up bg-blue-500"></div>
</div>
