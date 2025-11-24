<script>
  import { designTokens } from '$lib/design/index.js';
  import { GameBox } from '$lib/ui/components/index.js';
  import { Button } from '$lib/ui/primitives.js';
</script>

{#snippet snippetLandscape()}
  <div class="m-20up">
    <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
      Game content (landscape)
    </h3>
    <p class="text-base-md mb-20up">
      This is the main game content displayed in fullscreen mode.
    </p>
    <div class="w-200up h-200up bg-primary-500 rounded-md"></div>
  </div>
{/snippet}

{#snippet snippetPortrait()}
  <div class="m-20up">
    <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
      Game content (portrait)
    </h3>
    <p class="text-base-md mb-20up">
      This is the main game content displayed in fullscreen mode.
    </p>
    <div class="w-200up h-200up bg-secondary-500 rounded-md"></div>
  </div>
{/snippet}

{#snippet snippetRequireFullscreen(params)}
  <div class="flex flex-col items-center justify-center h-full p-20up">
    <h2 class="text-heading-h2 font-heading heading-font-weight mb-20up">
      Fullscreen required
    </h2>
    <p class="text-base-md mb-30up text-center max-w-500up">
      This game requires fullscreen mode for the best experience.
      Click the button below to enter fullscreen.
    </p>
    <p class="text-base-sm mb-20up text-surface-600">
      Note: On localhost, dev mode is automatically enabled.
      The fullscreen requirement is bypassed in dev mode.
    </p>
    <Button onclick={params.requestFullscreen}>
      Enter fullscreen
    </Button>
  </div>
{/snippet}

<GameBox
  classes="border-4 border-primary-500"
  marginLeft={20}
  marginRight={20}
  marginTop={20}
  marginBottom={20}
  aspectOnLandscape={16 / 9}
  aspectOnPortrait={9 / 16}
  designLandscape={designTokens.DESIGN}
  designPortrait={designTokens.DESIGN}
  clamping={designTokens.CLAMPING}
  enableScaling={true}
  allowDevModeOnLocalhost={false}
  debug={true}
  {snippetLandscape}
  {snippetPortrait}
  {snippetRequireFullscreen}
/>
