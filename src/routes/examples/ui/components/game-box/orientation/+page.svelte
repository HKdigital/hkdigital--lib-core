<script>
  import { designTokens } from '$lib/design/index.js';
  import { GameBox } from '$lib/ui/components.js';

  import Landscape from './Landscape.svelte';
  import Portrait from './Portrait.svelte';

  let widthLandscape = $state(0);
  let widthPortrait = $state(0);

  $inspect('widthLandscape', widthLandscape);
  $inspect('widthPortrait', widthPortrait);

</script>

<GameBox
  classes="border-4 border-red-500"
  marginLeft={20}
  marginRight={20}
  marginTop={20}
  marginBottom={20}
  aspectOnLandscape={16 / 9}
  aspectOnPortrait={1 / 1}
  designLandscape={designTokens.DESIGN}
  designPortrait={{ width: 1080, height: 1080 }}
  clamping={designTokens.CLAMPING}
  enableScaling={true}
  debug={true}
>
  {#snippet snippetLandscape()}
    <Landscape />
  {/snippet}

  {#snippet snippetPortrait()}
    <Portrait />
  {/snippet}
</GameBox>
<!--<br>&nbsp;
<br>&nbsp;
<br>-->
