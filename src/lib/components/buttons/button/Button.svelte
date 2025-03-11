<script>
  import { toStateClasses } from '$lib/util/design-system/index.js';

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   type?: string,
   *   role?: 'primary' | 'secondary' | 'tertiary' | 'custom',
   *   size?: 'sm' | 'md' | 'lg',
   *   variant?: string,
   *   active?: boolean,
   *   selected?: boolean,
   *   loading?: boolean,
   *   error?: boolean,
   *   disabled?: boolean,
   *   snippetLoading?: import('svelte').Snippet,
   *   snippetError?: import('svelte').Snippet,
   *   children: import('svelte').Snippet,
   *   [key: string]: any
   * }}
   */
  const {
    // Style
    base,
    bg,
    classes,

    type = '',
    role = 'primary',
    size = 'md',
    variant = '',

    // States
    active = $bindable(false),
    selected = $bindable(false),
    loading = $bindable(false),
    error = $bindable(false),
    disabled = $bindable(false),

    // Snippets
    snippetLoading,
    snippetError,
    children,

    // Attributes
    ...attrs
  } = $props();

  let stateClasses = $derived.by(() => {
    return toStateClasses({ active, selected, loading, error, disabled });
  });
</script>

<button
  data-component="button"
  data-type={type}
  data-role={role}
  data-size={size}
  data-variant={variant}
  type="button"
  class="{base} {bg} {classes} {stateClasses}"
  disabled={disabled || loading}
  aria-busy={loading}
  aria-pressed={selected}
  {...attrs}
>
  {#if loading && snippetLoading}
    {@render snippetLoading()}
  {:else if error && snippetError}
    {@render snippetError()}
  {:else}
    {@render children()}
  {/if}
</button>
