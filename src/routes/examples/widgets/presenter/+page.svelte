<script>
  import { TextButton } from '$lib/components/buttons/index.js';

  import {
    Presenter,
    createOrGetPresenterState
  } from '$lib/widgets/presenter/index.js';
  import { slides } from './slides.js';

  // Get a reference to the presenter state
  const presenter = createOrGetPresenterState();

  // Navigation functions
  function goToHello() {
    presenter.gotoSlide('hello');
  }

  function goToWorld() {
    presenter.gotoSlide('world');
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
</Presenter>

<div class="mt-20up flex gap-40up items-center justify-center">
  <TextButton role="secondary" onclick={goToHello}>Slide 1</TextButton>

  <TextButton role="secondary" onclick={goToWorld}>Slide 2</TextButton>
</div>
