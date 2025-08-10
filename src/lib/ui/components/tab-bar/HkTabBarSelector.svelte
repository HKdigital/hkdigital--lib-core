<script>
  // prettier-ignore
  // import { getTabBarSelectorState }
  //   from "./HkTabBarSelector.state.svelte.js";

  import { createOrGetState }
    from "./HkTabBarSelector.state.svelte.js";

  /**
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   boxBase?: string,
   *   boxBg?: string,
   *   boxPadding?: string,
   *   boxMargin?: string,
   *   boxClasses?: string,
   *   boxAttrs?: { [attr: string]: * },
   *   contextKey?: import('$lib/state/context/typedef.js').ContextKey
   * } & { [attr: string]: any }}
   */
  let {
    // Style
    base,
    bg,
    classes,
    boxBase,
    boxBg,
    boxClasses,

    // State
    contextKey
  } = $props();

  const selectorState = createOrGetState(contextKey);
</script>

<div
  data-hk-tab-bar-selector-box
  class="g-tab-bar-h w-full {boxBase} {boxBg} {boxClasses}"
>
  <div
    data-hk-tab-bar-selector
    bind:clientWidth={selectorState.selectorWidth}
    class="relative opacity-0 {base} {bg} {classes}"
    style={selectorState.selectorStyle}
  ></div>
</div>
