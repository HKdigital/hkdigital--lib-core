<script>
  import { onMount } from "svelte";

  onMount( () => {
    console.debug('Mounted landscape');
  } );

  let widthLandscape = $state(0);
  let heightLandscape = $state(0);
</script>

<div class="p-20up w-full h-full" bind:clientWidth={widthLandscape} bind:clientHeight={heightLandscape}>
  <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
    On landscape [{widthLandscape}x{heightLandscape}]
  </h3>
  <div class="w-100up h-100up bg-red-500"></div>
</div>
