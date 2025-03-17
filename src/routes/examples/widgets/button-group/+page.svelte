<script>
  import { ButtonGroup } from '$lib/widgets/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  /** @typedef {{text?: string, value?: any, label?: string, props?: Object}} ButtonDef */

  /** @type {ButtonDef} */
  let selected = $state(null);

  /* @type {( label:string ) => void } */
  let select = $state();

  // Button definitions
  /** @type {ButtonDef[]} */
  const buttons = [
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
  ];
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
