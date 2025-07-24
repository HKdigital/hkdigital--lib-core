<script>
  import { onMount } from 'svelte';

  import { TextButton } from '$lib/primitives/buttons/index.js';

  import { Presenter } from '$lib/components/presenter/index.js';

  import { slides } from './config/slides.js';
  import { SLIDE_HELLO, SLIDE_WORLD } from './config/labels.js';
  import { fade } from 'svelte/transition';

  let presenterRef = $state();

  let currentSlide = $state();

  // Navigation functions
  function goToHello() {
    currentSlide = 'slide1';

    presenterRef.gotoSlide(SLIDE_HELLO);
  }

  function goToWorld() {
    currentSlide = 'slide2';
    presenterRef.gotoSlide(SLIDE_WORLD);
  }

  onMount( goToHello );
</script>

<Presenter
  {slides}
  bind:presenterRef
  classes="h-[500px] border overflow-hidden"
>
  {#snippet layoutSnippet(slide, layer)}
    {#if slide && slide.data}
      {#if slide.data.component}
        <div class="justify-self-stretch self-stretch grid">
          <slide.data.component {...slide.data.props || {}} />
        </div>
      {/if}
    {/if}
  {/snippet}

  {#snippet loadingSnippet()}
    <div
      class="justify-self-stretch self-stretch grid bg-white opacity-50"
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
  <TextButton role="secondary" disabled={currentSlide==='slide1'} onclick={goToHello}>Slide 1</TextButton>

  <TextButton role="secondary" disabled={currentSlide==='slide2'} onclick={goToWorld}>Slide 2</TextButton>
</div>
