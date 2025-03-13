<script>
  /**
   * ButtonGroup component
   * A group of toggle buttons where only one can be active at
   * a time.
   */

  /** @typedef {{text: string, disabled?: boolean, props?: Object}} ButtonDef */

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   buttons: Array<ButtonDef>,
   *   selected?: (ButtonDef|null)
   *   buttonSnippet: import('svelte').Snippet<[{text: string, props: Object}]>,
   *   [attr: string]: any
   * }}
   */
  let {
    base = '',
    bg = '',
    classes = '',
    buttons = [],
    selected = $bindable(null),
    buttonSnippet,
    ...attrs
  } = $props();

  let selectedIndex = $state(-1);

  /**
   * Handle button selection
   */
  function handleSelect(index) {
    if (!buttons[index].disabled) {
      selectedIndex = index;
      selected = buttons[selectedIndex] ?? null;
    }
  }
</script>

<div
  data-component="button-group"
  class="{base} {bg} {classes} flex"
  role="group"
  aria-label="Button Group"
  {...attrs}
>
  {#each buttons as button, index}
    {@render buttonSnippet?.({
      text: button.text,
      props: {
        ...(button.props || {}),
        disabled: button.disabled,
        active: index === selectedIndex,
        onclick: () => handleSelect(index)
      }
    })}
  {/each}
</div>
