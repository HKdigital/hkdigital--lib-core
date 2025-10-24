<script>
  import faviconImages from './favicon.png?favicons';
  import appleTouchIcons from './favicon.png?apple-touch-icons';
</script>

<!-- <link rel="icon" type="image/svg+xml" href="/favicon.svg"> -->

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
