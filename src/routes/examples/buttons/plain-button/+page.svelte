<script>
  import { PlainPanel } from '$lib/components/panels/index.js';

  import { PanelRow2 } from '$lib/components/rows/index.js';

  import { PlainButton } from '$lib/components/buttons/index.js';
</script>

<!-- Normal -->

<PlainPanel>
  <PanelRow2>
    <PlainButton
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</PlainButton
    >
  </PanelRow2>

  <PanelRow2>
    <PlainButton
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</PlainButton
    >

    <PlainButton
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</PlainButton
    >
  </PanelRow2>

  <!-- Disabled -->

  <PanelRow2>
    <PlainButton
      role="primary"
      disabled={true}
      onclick={() => {
        console.log('Primary clicked');
      }}>Primary</PlainButton
    >

    <PlainButton
      role="secondary"
      disabled={true}
      onclick={() => {
        console.log('Secondary clicked');
      }}>Secondary</PlainButton
    >
  </PanelRow2>
</PlainPanel>
