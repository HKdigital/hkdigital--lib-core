<script>
  import { onMount, untrack } from 'svelte';

  import { ArmyGreen, ElectricBlue } from '../img/index.js';

  import ImageBox from '$lib/components/image/ImageBox.svelte';

</script>

<ImageBox
  image={ArmyGreen}
  fit="contain"
  position="center center"
  width="w-[200px]"
  height="h-[200px]"
  classes="border-8 border-green-500"
/>

<ImageBox
  image={ElectricBlue}
  fit="contain"
  position="center center"
  width="w-[200px]"
  height="h-[200px]"
  classes="border-8 border-green-500"
/>
