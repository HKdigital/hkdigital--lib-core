<script>
  /**
   * @type {{
   *   color: string
   * }}
   */
  let { color } = $props();

  import { Presenter } from '$lib/widgets/presenter/index.js';

  import { slides } from './config/slides.js';
  import { fade } from 'svelte/transition';

  $effect(() => {
    if (presenterRef) {
      presenterRef.gotoSlide(color);
    }
  });

  let presenterRef = $state();
</script>

<Presenter bind:presenterRef {slides} classes="w-full h-full overflow-hidden">
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
    <div class="absolute inset-0 grid" transition:fade={{ duration: 500 }}>
      <div
        class="justify-self-center self-center inline-block h-50up w-50up animate-spin rounded-full border-width-thick border-solid border-primary-500 border-t-transparent"
        role="status"
        aria-label="Laden"
      >
        <span class="sr-only">Laden...</span>
      </div>
    </div>
  {/snippet}
</Presenter>
