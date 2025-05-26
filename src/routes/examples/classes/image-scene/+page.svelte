<script>
  import { onMount, untrack } from 'svelte';

  import { ArmyGreen, ElectricBlue } from '../../assets/images.js';

  import { ImageBox } from '$lib/features/index.js';

  import ImageScene from '$lib/classes/svelte/image/ImageScene.svelte';

  const ARMY_GREEN = 'army-green';
  const ELECTRIC_BLUE = 'electric-blue';

  /** @type {ImageScene|null} */
  let imageScene = $state(null);

  onMount(async () => {
    console.log('ArmyGreen', ArmyGreen);
    console.log('ElectricBlue', ElectricBlue);

    //
    // Create image scene, define images and start loading
    //
    if (!imageScene) {
      imageScene = new ImageScene();

      // Define image sources

      imageScene.defineImage({ label: ARMY_GREEN, imageMeta: ArmyGreen });

      imageScene.defineImage({ label: ELECTRIC_BLUE, imageMeta: ElectricBlue });

      imageScene.load();
    }
  });

  $effect(() => {
    //
    // Debug: image scene loaded
    //
    if (imageScene?.loaded) {
      console.log('Scene loaded!');
    }
  });

  $effect(() => {
    //
    // Debug image scene progress
    //
    if (imageScene?.progress) {
      console.log('Progress', imageScene?.progress);
    }
  });

  // svelte-ignore non_reactive_update
  let armyGreenUrl;

  // svelte-ignore non_reactive_update
  let electricBlueUrl;

  $effect(() => {
    //
    // Update and destroy object url's in test width plain IMG elements
    //
    if (imageScene?.loaded) {
      armyGreenUrl = imageScene.getObjectURL(ARMY_GREEN);
      electricBlueUrl = imageScene.getObjectURL(ELECTRIC_BLUE);
    }

    return () => {
      if (armyGreenUrl) {
        URL.revokeObjectURL(armyGreenUrl);
        armyGreenUrl = undefined;
      }

      if (electricBlueUrl) {
        URL.revokeObjectURL(electricBlueUrl);
        electricBlueUrl = undefined;
      }
    };
  });
</script>

{#if imageScene}
  <ImageBox
    imageLoader={imageScene.getImageLoader(ARMY_GREEN)}
    fit="contain"
    position="center center"
    width="w-[200px]"
    height="h-[200px]"
    classes="border-8 border-green-500"
  />

  <ImageBox
    imageLoader={imageScene.getImageLoader(ELECTRIC_BLUE)}
    fit="contain"
    position="center center"
    width="w-[200px]"
    height="h-[200px]"
    classes="border-8 border-green-500"
  />
{/if}
{#if imageScene?.loaded}
  {#if armyGreenUrl}
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={armyGreenUrl} width="200px" />
  {/if}
  {#if electricBlueUrl}
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={electricBlueUrl} width="200px" />
  {/if}
{/if}
