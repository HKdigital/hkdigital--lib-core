<script>
  /**
   * @type {{
   *   percent: number,
   *   bytesLoaded?: number,
   *   totalBytes?: number,
   *   showBytes?: boolean,
   *   title?: string,
   *   classes?: string,
   *   animate?: boolean,
   *   showText?: boolean,
   *   overlay?: boolean,
   *   [attr: string]: any
   * }}
   */
  const {
    // Progress data
    percent = 0,
    bytesLoaded,
    totalBytes,

    // Display options
    showBytes = false,
    title = 'Loading',
    classes = '',
    animate = true,
    showText = true,
    overlay = true,

    // Additional attributes
    ...attrs
  } = $props();

  // Format bytes to KB or MB with appropriate suffix
  const formatBytes = (bytes) => {
    if (bytes === undefined) return '';

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format percentage as a string with % symbol
  const formatPercent = (value) => {
    return `${Math.round(value)}%`;
  };
</script>

<!-- Overlay version (covers entire screen) -->
{#if overlay}
  <div
    data-component="loading-indicator"
    class="fixed inset-0 flex items-center justify-center bg-surface-950/80 z-50 {classes}"
    {...attrs}
  >
    <div
      class="bg-surface-800 p-16up rounded-lg shadow-lg text-center max-w-[90%]"
    >
      <h2 class="text-heading-h3 font-heading mb-8ht text-surface-50">
        {title}
      </h2>

      <div
        class="w-[300px] h-[10px] bg-surface-600 rounded-full overflow-hidden mb-8bt"
      >
        <div
          class="h-full bg-primary-500 {animate
            ? 'transition-all duration-300'
            : ''}"
          style:width="{percent}%"
        ></div>
      </div>

      {#if showText}
        <p class="text-base-md text-surface-200">{formatPercent(percent)}</p>

        {#if showBytes && bytesLoaded !== undefined && totalBytes !== undefined}
          <p class="text-sm text-surface-300 mt-4bt">
            {formatBytes(bytesLoaded)} / {formatBytes(totalBytes)}
          </p>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Inline version -->
{:else}
  <div data-component="loading-indicator" class="w-full {classes}" {...attrs}>
    {#if title}
      <h3 class="text-heading-h5 font-heading mb-4ht">{title}</h3>
    {/if}

    <div
      class="w-full h-[6px] bg-surface-300 rounded-full overflow-hidden mb-4bt"
    >
      <div
        class="h-full bg-primary-500 {animate
          ? 'transition-all duration-300'
          : ''}"
        style:width="{percent}%"
      ></div>
    </div>

    {#if showText}
      <p class="text-base-sm text-surface-600">{formatPercent(percent)}</p>

      {#if showBytes && bytesLoaded !== undefined && totalBytes !== undefined}
        <p class="text-sm text-surface-500 mt-2bt">
          {formatBytes(bytesLoaded)} / {formatBytes(totalBytes)}
        </p>
      {/if}
    {/if}
  </div>
{/if}
