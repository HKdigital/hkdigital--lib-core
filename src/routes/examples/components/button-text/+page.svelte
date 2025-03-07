<script>
  import { TextButton } from '$lib/components/buttons/index.js';
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
