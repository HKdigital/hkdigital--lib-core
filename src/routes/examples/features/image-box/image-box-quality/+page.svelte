<script>
  import { onMount, untrack } from 'svelte';

  import { BumperOrg, BumperJpg, Bumper } from '../../../assets/images.js';

  import { ImageBox } from '$lib/features/index.js';

</script>

<img src={BumperOrg} class="image-org" alt="" />

<ImageBox
  imageMeta={Bumper}
  fit="contain"
  position="top left"
  width="w-[800px]"
  classes="bg-black"
/>

<ImageBox
  imageMeta={BumperJpg}
  fit="contain"
  position="top left"
  width="w-[800px]"
/>

<style>
  .image-org {
    width: 800px;
    object-fit: contain;
    background-color: black;
  }
</style>
