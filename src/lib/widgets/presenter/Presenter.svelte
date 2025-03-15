<script>
  /* ---------------------------------------------------------------- Imports */

  import { GridLayers } from '$lib/components/layout/index.js';

  import { createOrGetPresenterState } from './index.js';
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
   *   layoutSnippet: import('svelte').Snippet<[Slide|null, Layer]>
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

    // Snippets
    layoutSnippet
  } = $props();

  /* ------------------------------------------------------------------ State */

  const presenter = createOrGetPresenterState(instanceKey);

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
</GridLayers>
