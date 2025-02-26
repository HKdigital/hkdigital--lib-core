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
   *   instanceKey?: Symbol | string
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
    instanceKey
  } = $props();

  const selectorState = createOrGetState(instanceKey);
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
