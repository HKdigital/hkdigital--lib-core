<script>
  import { PlainPanel } from '$lib/components/panels/index.js';

  import { PanelRow2 } from '$lib/components/rows/index.js';

  import { Button } from '$lib/components/buttons/index.js';
</script>

<!-- Normal -->

<Button
  role="primary"
  onclick={() => {
    console.log('Primary clicked');
  }}><p>Primary</p></Button
>

<Button
  role="secondary"
  onclick={() => {
    console.log('Secondary clicked');
  }}><p>Secondary</p></Button
>

<hr />

<PlainPanel>
  <PanelRow2>
    <Button
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}
    >
      <p>Primary</p>
    </Button>
  </PanelRow2>

  <PanelRow2>
    <Button
      role="primary"
      onclick={() => {
        console.log('Primary clicked');
      }}><p>Primary</p></Button
    >

    <Button
      role="secondary"
      onclick={() => {
        console.log('Secondary clicked');
      }}><p>Secondary</p></Button
    >
  </PanelRow2>

  <!-- Disabled -->

  <PanelRow2>
    <Button
      role="primary"
      disabled={true}
      onclick={() => {
        console.log('Primary clicked');
      }}><p>Primary</p></Button
    >

    <Button
      role="secondary"
      disabled={true}
      onclick={() => {
        console.log('Secondary clicked');
      }}><p>Secondary</p></Button
    >
  </PanelRow2>
</PlainPanel>
