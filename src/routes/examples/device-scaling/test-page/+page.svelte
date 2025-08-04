<script>
  import TextButton from '$lib/ui/primitives/buttons/button/Button.svelte';
  import TextBlock from '$lib/ui/primitives/hkdev/blocks/TextBlock.svelte';
</script>

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
      eindeloos. Wij hebben de kennis in huis om gamification doelgericht toe te
      passen.
    </p>
  {/snippet}

  {#snippet footer()}
    <div class="grid-auto-left">
      <TextButton role="primary">Contact over gamification</TextButton>
    </div>
  {/snippet}
</TextBlock>
