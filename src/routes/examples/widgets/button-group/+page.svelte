<script>
  import { ButtonGroup } from '$lib/widgets/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  /** @type {{text: string, disabled?: boolean, props?: Object}} */
  let selected = $state(null);

  // Button definitions
  const buttons = [
    {
      text: 'One',
      props: { role: 'primary' }
    },
    {
      text: 'Two',
      props: { role: 'primary' }
    },
    {
      text: 'Three',
      disabled: true,
      props: { role: 'primary' }
    }
  ];
</script>

<div class="p-20up">
  <h3 class="text-heading-h3 font-heading mb-30up">Button group</h3>

  <p class="text-base font-base mb-30up">
    Selected button {selected?.text ?? 'none'}
  </p>

  <ButtonGroup {buttons} bind:selected classes="gap-4up">
    {#snippet buttonSnippet(button)}
      <TextButton {...button.props}>{button.text}</TextButton>
    {/snippet}
  </ButtonGroup>
</div>
