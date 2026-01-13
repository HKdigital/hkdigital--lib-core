<script>
  /**
   * ButtonGroup component
   * A group of toggle buttons where only one can be active at
   * a time.
   */

  import { onMount } from 'svelte';
  import { findFirst } from '$lib/util/array.js';

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   buttons: Array<import('./typedef.js').ButtonDef>,
   *   selected?: (import('./typedef.js').ButtonDef|null),
   *   select?: ( label:string ) => void,
   *   buttonSnippet: import('svelte').Snippet<[{text: string, value: string, label: string, props: Object}]>,
   *   [attr: string]: any
   * }}
   */
  let {
    base = '',
    bg = '',
    classes = '',
    buttons = [],
    selected = $bindable(null),
    select = $bindable(),
    buttonSnippet,
    ...attrs
  } = $props();

  let selectedIndex = $state(-1);

  /**
   * Handle button selection
   */
  function handleSelect(index) {
    if (!buttons[index].props?.disabled) {
      selectedIndex = index;
      selected = buttons[selectedIndex] ?? null;
    }
  }

  function handleSelectByLabel(label) {
    for (let j = 0; j < buttons.length; j = j + 1) {
      if (buttons[j].label === label) {
        selectedIndex = j;
        selected = buttons[j] ?? null;
        break;
      }
    }
  }

  onMount(() => {
    select = handleSelectByLabel;
  });
</script>

<div
  data-component="button-group"
  class="{base} {bg} {classes} flex"
  role="group"
  aria-label="Button group"
  {...attrs}
>
  {#each buttons as button, index}
    {#if !button.hide}
      {@render buttonSnippet?.({
        text: button.text,
        value: button.value,
        label: button.label,
        props: {
          ...(button.props || {}),
          selected: index === selectedIndex,
          onclick: () => handleSelect(index)
        }
      })}
    {/if}
  {/each}
</div>
