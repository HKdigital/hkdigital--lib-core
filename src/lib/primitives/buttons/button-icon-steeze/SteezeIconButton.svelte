<script>
  import Button from '../button/Button.svelte';

  import { SteezeIcon } from '$lib/primitives/icons/index.js';

  /**
   * @type {{
   *   src: import('$lib/primitives/icons/typedef.js').IconSource,
   *   iconSize?: string,
   *   theme?: string,
   *   [key: string]: any
   * }}
   */
  const {
    // Icon
    src,
    iconSize,
    theme,

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<Button type="icon-steeze" {...attrs}>
  <SteezeIcon {src} size={iconSize} {theme} />
</Button>
