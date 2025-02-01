<script>
  import { onMount } from 'svelte';

  import { ImageLoader } from '$lib/classes/svelte/image/index.js';

  import ArmyGreen from '../assets/img/army-green.jpg?preset=gradient';

  // console.log(ArmyGreen);

  import ElectricBlue from '../assets/img/electric-blue.jpg?preset=gradient';

  console.log('ElectricBlue', ElectricBlue);

  let imageLoader = $state();

  const imageMeta = ArmyGreen;

  onMount(() => {
    // @ts-ignore
    const url = imageMeta.src;

    if (!url) {
      throw new Error('Missing image url');
    }

    imageLoader = new ImageLoader({ url });

    imageLoader.load();
  });

  let objectURL = $state();

  $effect(() => {
    if (imageLoader?.loaded) {
      objectURL = imageLoader.getObjectURL();
      console.log(`Created objectURL ${imageLoader.url}`);
    }

    return () => {
      if (objectURL) {
        console.log(`Revoke objectURL ${imageLoader.url}`);
        URL.revokeObjectURL(objectURL);
      }
    };
  });
</script>

{#if imageMeta}
  <button
    onclick={() => {
      imageLoader?.unload();
    }}
  >
    Unload (revoke objectURL)
  </button>
  <br />
  <img
    src={objectURL}
    width={imageMeta.width}
    height={imageMeta.height}
    alt=""
  />
{/if}

<style>
  button {
    border: solid 1px black;
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.25rem;
  }
</style>
