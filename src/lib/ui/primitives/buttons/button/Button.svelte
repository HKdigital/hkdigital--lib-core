<script>
  import { toStateClasses } from '$lib/design/index.js';

  /**
   * @type {{
   *   class?: string,
   *   base?: string,  // Deprecated: use 'class' instead
   *   bg?: string,  // Deprecated: use 'class' instead
   *   classes?: string,  // Deprecated: use 'class' instead
   *   type?: string,
   *   role?: 'primary' | 'secondary' | 'tertiary' | 'custom',
   *   size?: 'sm' | 'md' | 'lg',
   *   variant?: string,
   *   mode?: 'light'|'dark'
   *   buttonType?: 'button' | 'submit' | 'reset',
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
    class: className,
    base,  // Deprecated: kept for backward compatibility
    bg,  // Deprecated: kept for backward compatibility
    classes,  // Deprecated: kept for backward compatibility

    type = '',
    role = 'primary',
    size = 'md',
    variant = '',
    mode = 'light',

    buttonType = 'button',

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
  data-mode={mode}
  type={buttonType}
  class="{base ?? ''} {bg ?? ''} {className ?? classes ?? ''} {stateClasses}"
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
