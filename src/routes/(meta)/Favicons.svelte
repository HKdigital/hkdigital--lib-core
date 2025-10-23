<script>
  import { favicons, appleTouchIcons } from './config.js';
</script>

<!-- <link rel="icon" type="image/svg+xml" href="/favicon.svg"> -->

<svelte:head>
  <!-- Basic favicon configuration -->
  {#each favicons as img}
    <link
      rel="icon"
      type="image/png"
      sizes="{img.size}x{img.size}"
      href={img.url}
    />
  {/each}

  {#each appleTouchIcons as img}
    <link rel="apple-touch-icon" sizes="{img.size}x{img.size}" href={img.url} />
  {/each}
</svelte:head>
