<script>
  import Button from '../button/Button.svelte';

  import { SteezeIcon } from '$lib/components/icons/index.js';

  /**
   * @type {{
   *   src: import('$lib/components/icons/typedef.js').IconSource,
   *   size?: string,
   *   subset?: string,
   *   [key: string]: any
   * }}
   */
  const {
    // Icon
    src,
    iconSize,
    subset,

    // Snippets
    children,

    // Attributes
    ...attrs
  } = $props();
</script>

<Button type="icon-steeze" {...attrs}>
  <SteezeIcon {src} size={iconSize} {subset} />
</Button>
