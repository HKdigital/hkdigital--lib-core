<script>
  import { BumperOrg, BumperJpg, Bumper } from '../../../assets/images.js';

  // import { TrailerEmpty } from '../../../assets/images.js';

  import { ImageBox } from '$lib/ui/components/index.js';

</script>

<!-- <ImageBox
  imageSource={TrailerEmpty}
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
  imageSource={Bumper}
  fit="contain"
  position="top left"
  width="w-[800px]"
  classes="bg-black"
  onProgress={(progress, id)=> {
    console.debug("progress", progress);
  }}
/>

<ImageBox
  imageSource={BumperJpg}
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
