<script>
  import { PlainPanel } from '$lib/components/panels/index.js';

  import { PanelRow2 } from '$lib/components/rows/index.js';

  import { TextButton } from '$lib/components/buttons/index.js';

  import { Button } from '$lib/components/buttons/index.js';
</script>

<TextButton
  role="primary"
  onclick={() => {
    console.log('Primary clicked');
  }}>Primary</TextButton
>

<TextButton
  role="secondary"
  onclick={() => {
    console.log('Secondary clicked');
  }}>Secondary</TextButton
>

<hr />

<Button
  role="primary"
  onclick={() => {
    console.log('Primary clicked');
  }}>Primary</Button
>

<Button
  role="secondary"
  onclick={() => {
    console.log('Secondary clicked');
  }}>Secondary</Button
>
