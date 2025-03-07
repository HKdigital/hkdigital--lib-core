<script>
  import Button from '$lib/components/buttons/button/Button.svelte';
  import TextBlock from '$lib/components/hkdev/blocks/TextBlock.svelte';
  import CheckButton from '$lib/components/hkdev/buttons/CheckButton.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    function updateScaleValues() {
      // Same function as above
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const scaleW = vw / 1920;
      const scaleH = vh / 1080;

      const scaleViewport = Math.min(scaleW, scaleH);

      const scaleUI = Math.max(0.3, Math.min(scaleViewport, 2));
      const scaleTextBase = Math.max(0.75, Math.min(scaleViewport, 1.5));
      const scaleTextHeading = Math.max(0.75, Math.min(scaleViewport, 2.25));
      const scaleTextUi = Math.max(0.5, Math.min(scaleViewport, 1.25));

      document.documentElement.style.setProperty('--scale-w', String(scaleW));
      document.documentElement.style.setProperty('--scale-h', String(scaleH));
      document.documentElement.style.setProperty(
        '--scale-viewport',
        String(scaleViewport)
      );
      document.documentElement.style.setProperty('--scale-ui', String(scaleUI));
      document.documentElement.style.setProperty(
        '--scale-text-content',
        String(scaleTextBase)
      );
      document.documentElement.style.setProperty(
        '--scale-text-heading',
        String(scaleTextHeading)
      );
      document.documentElement.style.setProperty(
        '--scale-text-ui',
        String(scaleTextUi)
      );
    }

    updateScaleValues();
    window.addEventListener('resize', updateScaleValues);

    return () => {
      window.removeEventListener('resize', updateScaleValues);
    };
  });

  const buttons = [
    { title: 'Toepassingen voor bedrijven' },
    { title: 'Toepassingen voor scholen' },
    { title: 'Toepassingen voor evenementen' },
    { title: 'Gamification' },
    { title: 'Mini-games' },
    { title: 'Iets anders' }
  ];
</script>

<div class="px-20p w-full h-screen bg-blue-950 text-white">
  <div class="flex flex-col space-y-4">
    <div class="flex flex-wrap gap-4 w-full md:w-11/12 mb-30p">
      {#each buttons as button}
        <CheckButton
          title={button.title}
          classes="rounded-full text-surface-150 font-bold"
          inactiveChild={true}
          activeChild={true}
          activeClasses="bg-tertiary-500"
          inactiveClasses="border-tertiary-300 border-2"
          topic={button.title}
        />
      {/each}
    </div>
  </div>

  <TextBlock class="row block-lg2 items-center justify-self-start">
    {#snippet title()}
      Gamification
    {/snippet}

    {#snippet content()}
      <p class="p">
        Gamification is het toepassen van spelelementen op (serieuze) processen.
        Gamification wordt eigenlijk al overal gebruikt. Applicaties speelt soms
        bijvoorbeeld in op de nieuwsgierigheid van de gebruikers, of wordt er
        gebruik gemaakt van een puntensysteem of levels. De mogelijkheden zijn
        eindeloos. Wij hebben de kennis in huis om gamification doelgericht toe
        te passen.
      </p>
    {/snippet}

    {#snippet footer()}
      <div class="grid-auto-left">
        <Button classes="text-surface-50" role="primary"
          >Contact over gamification</Button
        >
      </div>
    {/snippet}
  </TextBlock>
</div>
