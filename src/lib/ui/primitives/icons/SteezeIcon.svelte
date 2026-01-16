<script>
  /**
   * Steeze like icon component
   * The main difference with the original Steeze svelte component is that
   * the component follows the conventions used for components in
   * this library
   *
   * @see https://github.com/steeze-ui/icons
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
   * theme - name of the icon theme (e.g. 'solid' or 'outline')
   *
   * @type {{
   *   base?: string,
   *   classes?: string
   *   size?: string,
   *   variant?: string,
   *   src: import('./typedef.js').IconSource,
   *   theme?: string,
   * } & { [attr: string]: any }}
   */
  let {
    // Style
    base,
    classes,

    size = 'md',
    variant = '',

    // Functional
    src,
    theme = 'default', // icon theme 'default'|'solid'|'outline'...

    // States
    // ...

    // Attributes
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
</script>

{#if icon}
  <svg
    data-component="icon"
    data-type="steeze"
    data-size={size}
    data-variant={variant}
    {...icon.a}
    xmlns="http://www.w3.org/2000/svg"
    class="{base} {classes}"
    {...attrs}
  >
    {#each icon.path ?? [] as a}
      <path {...a} />
    {/each}
    {#each icon.rect ?? [] as a}
      <rect {...a} />
    {/each}
    {#each icon.circle ?? [] as a}
      <circle {...a} />
    {/each}
    {#each icon.polygon ?? [] as a}
      <polygon {...a} />
    {/each}
    {#each icon.polyline ?? [] as a}
      <polyline {...a} />
    {/each}
    {#each icon.line ?? [] as a}
      <line {...a} />
    {/each}
  </svg>
{/if}
