<script>
  import { BumperOrg, BumperJpg, Bumper } from '../../../assets/images.js';

  // import { TrailerEmpty } from '../../../assets/images.js';

  import { ImageBox } from '$lib/features/index.js';

</script>

<!-- <ImageBox
  imageMeta={TrailerEmpty}
  fit="contain"
  position="top left"
  width="w-[800px]"
  classes="bg-black"
  onProgress={(progress, id)=> {
    console.debug("progress", progress);
  }}
/> -->

<img src={BumperOrg} class="image-org" alt="" />

<ImageBox
  imageMeta={Bumper}
  fit="contain"
  position="top left"
  width="w-[800px]"
  classes="bg-black"
  onProgress={(progress, id)=> {
    console.debug("progress", progress);
  }}
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
