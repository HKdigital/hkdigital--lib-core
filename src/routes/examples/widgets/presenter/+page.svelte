<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import {
    Presenter,
    createOrGetPresenterState
  } from '$lib/widgets/presenter/index.js';

  import { slides } from './config/slides.js';
  import { SLIDE_HELLO, SLIDE_WORLD } from './config/labels.js';
  import { fade } from 'svelte/transition';

  // @note due to an issue; create the presenter state outside of the component
  //       or transitions dont work...
  const presenter = createOrGetPresenterState();

  // Navigation functions
  function goToHello() {
    console.log(presenter);
    presenter.gotoSlide(SLIDE_HELLO);
  }

  function goToWorld() {
    presenter.gotoSlide(SLIDE_WORLD);
  }
</script>

<Presenter
  {slides}
  startSlide="hello"
  classes="h-[500px] border overflow-hidden"
>
  {#snippet layoutSnippet(slide, layer)}
    {#if slide && slide.data}
      {#if slide.data.component}
        <div class="absolute inset-0">
          <slide.data.component {...slide.data.props || {}} />
        </div>
      {/if}
    {/if}
  {/snippet}

  {#snippet loadingSnippet()}
    <div
      class="absolute inset-0 bg-white opacity-50 grid"
      transition:fade={{ duration: 500 }}
    >
      <div
        class="justify-self-center self-center inline-block h-50up w-50up animate-spin rounded-full border-width-thick border-solid border-black border-t-transparent"
        role="status"
        aria-label="Laden"
      >
        <span class="sr-only">Laden...</span>
      </div>
    </div>
  {/snippet}
</Presenter>

<div class="mt-20up flex gap-40up items-center justify-center">
  <TextButton role="secondary" onclick={goToHello}>Slide 1</TextButton>

  <TextButton role="secondary" onclick={goToWorld}>Slide 2</TextButton>
</div>
