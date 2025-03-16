<script>
  import { GridLayers } from '$lib/components/layout/index.js';

  import Slideshow from './Slideshow.svelte';

  import {
    LABEL_RUSTY,
    LABEL_ARMY_GREEN,
    LABEL_ELECTRIC_BLUE,
    LABEL_LEMON_YELLOW,
    LABEL_OPAQUE_PURPLE,
    LABEL_SUNSET_ORANGE,
    LABEL_TOMATO_RED
  } from '$lib/assets/autospuiten/labels.js';

  let colorLabels = [
    LABEL_RUSTY,
    LABEL_ARMY_GREEN,
    LABEL_ELECTRIC_BLUE,
    LABEL_LEMON_YELLOW,
    LABEL_OPAQUE_PURPLE,
    LABEL_SUNSET_ORANGE,
    LABEL_TOMATO_RED
  ];

  let color = $state(LABEL_RUSTY);

  $effect(() => {
    if (color) {
      console.log('color', color);
    }
  });
</script>

<GridLayers
  data-module="autospuiten"
  data-scene="car-paint-picker"
  classes="w-[800px] h-[450px]"
>
  <div data-layer="slideshow">
    <Slideshow {color} />
  </div>

  <div
    data-layer="controls"
    class="bg-black text-white p-10up flex gap-4 h-min"
  >
    {#each colorLabels as colorLabel}
      <button
        class="border-width-thin border-white p-4bt"
        onclick={() => {
          color = colorLabel;
        }}>{colorLabel}</button
      >
    {/each}
  </div>
</GridLayers>
