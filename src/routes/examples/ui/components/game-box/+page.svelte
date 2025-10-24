<script>
  import { designTokens } from '$lib/design/index.js';
  import { GameBox } from '$lib/ui/components/index.js';
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
>
  {#snippet snippetLandscape()}
    <div class="m-20up">
      <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
        On landscape
      </h3>
      <div class="w-100up h-100up bg-red-500"></div>
    </div>
  {/snippet}

  {#snippet snippetPortrait()}
    <div class="m-20up">
      <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
        On portrait
      </h3>
      <div class="w-100up h-100up bg-blue-500"></div>
    </div>
  {/snippet}
</GameBox>
<!--<br>&nbsp;
<br>&nbsp;
<br>-->
