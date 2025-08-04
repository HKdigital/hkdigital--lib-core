<script>
  import { onMount } from 'svelte';

  import { ImageLoader } from '$lib/network/loaders.js';

  import ArmyGreen from '../../assets/images/army-green.jpg?preset=gradient';

  // console.log(ArmyGreen);

  import ElectricBlue from '../../assets/images/electric-blue.jpg?preset=gradient';

  console.log('ElectricBlue', ElectricBlue);

  let imageLoader = $state();

  const imageSource = ArmyGreen;

  onMount(() => {
    // @ts-ignore
    const url = imageSource.src;

    if (!url) {
      throw new Error('Missing image url');
    }

    imageLoader = new ImageLoader({ imageSource });

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
