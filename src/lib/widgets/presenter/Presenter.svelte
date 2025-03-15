<script>
  /* ---------------------------------------------------------------- Imports */

  import { GridLayers } from '$lib/components/layout/index.js';

  import { PresenterState } from './Presenter.state.svelte.js';
  import { getPresenterState } from './index.js';
  import { cssBefore, cssDuring } from './util.js';

  /* ------------------------------------------------------------------ Props */

  /**
   * @typedef {import("./typedef.js").Slide} Slide
   */

  /**
   * @typedef {import("./typedef.js").Layer} Layer
   */

  /**
   * @type {{
   *   classes?: string,
   *   slides?: import("./typedef.js").Slide[],
   *   autostart?: boolean,
   *   startSlide?: string,
   *   instanceKey?: Symbol | string,
   *   presenter?: import('./Presenter.state.svelte.js').PresenterState,
   *   layoutSnippet: import('svelte').Snippet<[Slide|null, Layer]>,
   *   loadingSnippet?: import('svelte').Snippet,
   * }}
   */
  let {
    // > Style
    classes,

    // > Functional
    slides,
    autostart = false,
    startSlide,

    // State
    instanceKey,

    presenter = $bindable(new PresenterState()),

    // Snippets
    layoutSnippet,
    loadingSnippet
  } = $props();

  // > Create presenter state object and register using setContext

  // FIXME: Using getPresenterState to force creation of presenter outside
  //        the component. Otherwise transitions doe not work somehow..
  presenter = getPresenterState(instanceKey);

  // > State

  $effect.pre(() => {
    // Configure presenter with slides if provided
    presenter.configure({ slides, autostart, startSlide });
  });

  let classesA = $state('');
  let classesB = $state('');

  let stylesA = $state('');
  let stylesB = $state('');

  //> Apply stage classes and styles

  $effect(() => {
    // > layerA

    const { stageBeforeIn, stageIn, stageBeforeOut, stageOut, transitions } =
      presenter.layerA;

    if (transitions && transitions.length) {
      if (stageBeforeIn || stageBeforeOut) {
        ({ style: stylesA, classes: classesA } = cssBefore(transitions));
      } else if (stageIn || stageOut) {
        setTimeout(() => {
          ({ style: stylesA, classes: classesA } = cssDuring(transitions));
        });
      }
    } else {
      stylesA = '';
      classesA = '';
    }
  });

  $effect(() => {
    // > layerB

    const { stageBeforeIn, stageIn, stageBeforeOut, stageOut, transitions } =
      presenter.layerB;

    if (transitions) {
      if (stageBeforeIn || stageBeforeOut) {
        ({ style: stylesB, classes: classesB } = cssBefore(transitions));
      } else if (stageIn || stageOut) {
        setTimeout(() => {
          ({ style: stylesB, classes: classesB } = cssDuring(transitions));
        });
      }
    } else {
      stylesB = '';
      classesB = '';
    }
  });
</script>

<GridLayers data-component="presenter" {classes}>
  <div
    style:z-index={presenter.layerA.z}
    style:visibility={presenter.layerA.visible ? 'visible' : 'hidden'}
    inert={presenter.busy}
    class="justify-self-stretch self-stretch overflow-hidden"
  >
    <div class="{classesA} h-full w-full" style={stylesA}>
      {@render layoutSnippet(presenter.slideA, presenter.layerA)}
    </div>
  </div>

  <div
    style:z-index={presenter.layerB.z}
    style:visibility={presenter.layerB.visible ? 'visible' : 'hidden'}
    inert={presenter.busy}
    class="justify-self-stretch self-stretch overflow-hidden"
  >
    <div class="{classesB} h-full w-full" style={stylesB}>
      {@render layoutSnippet(presenter.slideB, presenter.layerB)}
    </div>
  </div>

  {#if loadingSnippet && presenter.loadingSpinner}
    <div class="h-full w-full" style="z-index:20;">
      {@render loadingSnippet()}
    </div>
  {/if}
</GridLayers>
