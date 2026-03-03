<script>
  /**
   * Favicons component
   *
   * Generates favicon and apple-touch-icon links for browsers and PWAs.
   *
   * @typedef {import('../typedef.js').MetaConfig} MetaConfig
   */

  /** @type {{ config: MetaConfig }} */
  let { config } = $props();

  let { faviconImages, appleTouchIcons } = $derived(config);
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
