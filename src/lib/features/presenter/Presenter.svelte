<script>
  import { onMount } from 'svelte';

  import { GridLayers } from '$lib/components/layout/index.js';

  import { PresenterState } from './Presenter.state.svelte.js';
  import { cssBefore, cssDuring, waitForRender } from './util.js';

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
   *   presenterRef?: import('./Presenter.state.svelte.js').PresenterRef,
   *   layoutSnippet: import('svelte').Snippet<[Slide|null, Layer]>,
   *   loadingSnippet?: import('svelte').Snippet,
   * }}
   */
  let {
    // > Style
    classes,

    // > Functional
    slides,
    presenterRef = $bindable(),

    // Snippets
    layoutSnippet,
    loadingSnippet
  } = $props();

  const presenter = new PresenterState();

  onMount(() => {
    // Configure presenter with slides if provided
    presenter.configure({ slides });
    presenterRef = presenter.getPresenterRef();
  });

  // > State

  let classesA = $state('');
  let classesB = $state('');

  let stylesA = $state('');
  let stylesB = $state('');

  //> Apply stage classes and styles

  $effect(() => {
    // > layerA

    const { stageBeforeIn, stageIn, stageBeforeOut, stageOut, transitions } =
      presenter.layerA;

    if (transitions?.length) {
      // console.debug('layerA:transitions', transitions, {
      //   stageBeforeIn,
      //   stageIn,
      //   stageBeforeOut,
      //   stageOut
      // });

      if (stageBeforeIn || stageBeforeOut) {
        ({ style: stylesA, classes: classesA } = cssBefore(transitions));
      } else if (stageIn || stageOut) {
        waitForRender(() => {
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

    if (transitions?.length) {
      // console.debug('layerB:transitions', transitions, {
      //   stageBeforeIn,
      //   stageIn,
      //   stageBeforeOut,
      //   stageOut
      // });

      if (stageBeforeIn || stageBeforeOut) {
        ({ style: stylesB, classes: classesB } = cssBefore(transitions));
      } else if (stageIn || stageOut) {
        waitForRender(() => {
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
