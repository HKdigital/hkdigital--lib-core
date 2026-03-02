<script>
  /**
   * Favicons component
   *
   * Generates favicon and apple-touch-icon links for browsers and PWAs.
   *
   * @typedef {Object} FaviconsConfig
   * @property {Array<{src: string, width: number}>} faviconImages
   *   Processed favicon images from imagetools
   * @property {Array<{src: string, width: number}>} appleTouchIcons
   *   Processed apple-touch-icon images from imagetools
   */

  /** @type {{ config: FaviconsConfig }} */
  let { config } = $props();

  const { faviconImages, appleTouchIcons } = config;
</script>

<svelte:head>
  <!-- Basic favicon configuration -->
  {#each faviconImages as img}
    <link
      rel="icon"
      type="image/png"
      sizes="{img.width}x{img.width}"
      href={img.src}
    />
  {/each}

  {#each appleTouchIcons as img}
    <link rel="apple-touch-icon" sizes="{img.width}x{img.width}" href={img.src} />
  {/each}
</svelte:head>
