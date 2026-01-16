<script>
  /**
   * ===================================
   * @depreceated Use SteezeIcon instead
   * ===================================
   *
   *
   * Icon component
   *
   * Source code adapted from
   * @see https://github.com/steeze-ui/icons
   *
   *
   * Install icons
   * For icon packs @see https://github.com/steeze-ui/icons
   *
   * @eg install Hero Icons
   *
   * pnpm add -D @steeze-ui/heroicons
   */

  /**
   * Properties
   * ----------
   * src - icon component
   * size - width and height of the icon as percentage (..%) or in pixels
   * theme - name of the icon set theme (e.g. 'solid' or 'outline')
   *
   * @type {{
   *   src: import('./typedef.js').IconSource,
   *   size?: string,
   *   theme?: string,
   *   base?: string,
   *   classes?: string
   * } & { [attr: string]: any }}
   */
  let {
    src,
    size = '100%',
    theme = 'default',
    base,
    classes,
    ...attrs
  } = $props();

  /** @type {import('./typedef.js').IconThemeSource|null} */
  let icon = $state(null);

  $effect(() => {
    if( src )
    {
      icon = src[theme] ?? src?.['default'] ?? Object.values(src)?.[0];
    }
    else {
      throw new Error('Missing property [src]');
    }
  });

  let normalizedSize = $derived.by(() => {
    if (size !== '100%' && size.slice(-1) !== '%') {
      try {
        return parseInt(size, 10) + 'px';
      } catch (error) {
        return '100%';
      }
    }
    return size;
  });
</script>

{#if icon}
  <svg
    data-hk-icon
    {...icon?.a}
    xmlns="http://www.w3.org/2000/svg"
    width={normalizedSize}
    height={normalizedSize}
    class="{base} {classes}"
    {...attrs}
  >
    {#each icon?.path ?? [] as a}
      <path {...a} />
    {/each}
    {#each icon?.rect ?? [] as a}
      <rect {...a} />
    {/each}
    {#each icon?.circle ?? [] as a}
      <circle {...a} />
    {/each}
    {#each icon?.polygon ?? [] as a}
      <polygon {...a} />
    {/each}
    {#each icon?.polyline ?? [] as a}
      <polyline {...a} />
    {/each}
    {#each icon?.line ?? [] as a}
      <line {...a} />
    {/each}
  </svg>
{/if}
