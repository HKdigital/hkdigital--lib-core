<script>
  /**
   * Steeze like icon component
   * The main difference with the original Steeze svelte component is that
   * the component follows the conventions used for components in this library
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
   * subset - name of the icon subset (e.g. 'solid' or 'outline')
   *
   * @type {{
   *   src: import('./typedef.js').IconSource,
   *   size?: string,
   *   subset?: string,
   *   base?: string,
   *   classes?: string
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
    subset = 'default', // icon subset 'default'|'solid'|'outline'...

    // States
    // ...

    // Attributes
    ...attrs
  } = $props();

  /** @type {any} */
  let icon = $state();

  $effect(() => {
    icon = src?.[subset] ?? src?.['default'] ?? Object.values(src)?.[0];
  });

  // if (size !== '100%') {
  //   if (size.slice(-1) !== '%') {
  //     try {
  //       size = parseInt(size, 10) + 'px';
  //     } catch (error) {
  //       size = '100%';
  //     }
  //   }
  // }
</script>

<svg
  data-component="icon"
  data-type="steeze"
  data-size={size}
  {...icon?.a}
  xmlns="http://www.w3.org/2000/svg"
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
