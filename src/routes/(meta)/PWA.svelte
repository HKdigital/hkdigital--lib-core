<script>
  import { onMount } from 'svelte';
  import {
    themeColor,
    statusBarStyle,
    name,
    shortName,
    disablePageZoom
  } from './config.js';

  let shouldSetTitle = $state(false);

  onMount(() => {
    // Check if title element exists and has content
    const titleElement = document.querySelector('title');
    const hasTitle = titleElement && titleElement.textContent.trim() !== '';

    if (!hasTitle) {
      shouldSetTitle = true;
    }
  });
</script>

<svelte:head>
  {#if shouldSetTitle}
    <title>{name}</title>
  {/if}

  {#if !disablePageZoom}
    <meta name="viewport" content="width=device-width, initial-scale=1">
  {:else}
    <meta name="viewport"
         content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no, width=device-width, viewport-fit=cover" />
  {/if}

  <meta name="theme-color" content="{themeColor}">
  <link rel="manifest" href="/manifest.json">

  <!-- iOS-specific meta tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="{statusBarStyle}">
  <meta name="apple-mobile-web-app-title" content="{shortName}">

</svelte:head>
