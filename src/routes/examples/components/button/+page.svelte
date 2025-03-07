<script>
  import { Button } from '$lib/components/buttons/index.js';
</script>

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
