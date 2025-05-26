<script>
  import { ButtonGroup } from '$lib/features/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  /** @type {import('$lib/features/index.js').ButtonDef} */
  let selected = $state(null);

  /* @type {( label:string ) => void } */
  let select = $state();

  // Button definitions
  /** @type {import('$lib/features/index.js').ButtonDef[]} */
  const buttons = $state([
    {
      text: 'One',
      label: 'one',
      props: { role: 'primary' }
    },
    {
      text: 'Two',
      label: 'two',
      props: { role: 'primary' }
    },
    {
      text: 'Three',
      label: 'three',
      props: { role: 'primary', disabled: true }
    }
  ]);

  setTimeout(() => {
    // Hide button 3 that was disabled anyway...
    buttons[2].hide = true;
  }, 3000);
</script>

<div class="p-20up">
  <h3 class="text-heading-h3 font-heading mb-30up">Button group</h3>

  <p class="text-base font-base mb-30up">
    Selected button {selected?.text ?? 'none'}
  </p>

  <ButtonGroup {buttons} bind:selected bind:select classes="gap-4up">
    {#snippet buttonSnippet(button)}
      <TextButton {...button.props}>{button.text}</TextButton>
    {/snippet}
  </ButtonGroup>
  <br />
  <TextButton
    onclick={() => {
      select?.('one');
    }}>Select one</TextButton
  >
</div>
