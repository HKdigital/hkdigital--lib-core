<script>
  import { onMount } from 'svelte';

  import { ImageLoader } from '$lib/network/loaders.js';

  import ArmyGreen from '$examples/assets/images/army-green.jpg?preset=gradient';

  // console.log('ArmyGreen', ArmyGreen);

  // import ElectricBlue from '$examples/assets/images/electric-blue.jpg?preset=gradient';

  // console.log('ElectricBlue', ElectricBlue);


  let imageLoader = $state();

  const imageSource = ArmyGreen;

  onMount(() => {
    // @ts-ignore
    const url = imageSource[0].src;

    if (!url) {
      throw new Error('Missing image url');
    }

    imageLoader = new ImageLoader(imageSource);

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

{#if imageSource}
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
    width={imageSource[0].width}
    height={imageSource[0].height}
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
