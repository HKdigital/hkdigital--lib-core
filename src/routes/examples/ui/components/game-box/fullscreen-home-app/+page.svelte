<script>
  import { designTokens } from '$lib/design/index.js';
  import { GameBox } from '$lib/ui/components.js';
  import { Button } from '$lib/ui/primitives.js';
</script>

{#snippet snippetLandscape()}
  <div class="m-20up">
    <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
      Game content (landscape)
    </h3>
    <p class="text-base-md mb-20up">
      This is the main game content. On mobile, you were prompted to
      install as home screen app first.
    </p>
    <div class="w-200up h-200up bg-success-500 rounded-md"></div>
  </div>
{/snippet}

{#snippet snippetPortrait()}
  <div class="m-20up">
    <h3 class="text-heading-h3 font-heading heading-font-weight pb-30up">
      Game content (portrait)
    </h3>
    <p class="text-base-md mb-20up">
      This is the main game content. On mobile, you were prompted to
      install as home screen app first.
    </p>
    <div class="w-200up h-200up bg-warning-500 rounded-md"></div>
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

{#snippet snippetInstallOnHomeScreen(params)}
  <div class="flex flex-col items-center justify-center h-full p-20up">
    <h2 class="text-heading-h2 font-heading heading-font-weight mb-20up">
      Install as app
    </h2>
    <p class="text-base-md mb-20up text-center max-w-500up">
      For the best gaming experience, please install this app
      on your home screen.
    </p>

    {#if params.isIos}
      <div class="text-base-sm mb-20up text-center max-w-500up">
        <p class="mb-12bt font-semibold">iOS instructions:</p>
        <ol class="text-left list-decimal list-inside">
          <li class="mb-8bt">
            Tap the Share button (square with arrow)
          </li>
          <li class="mb-8bt">Scroll down and tap "Add to Home Screen"</li>
          <li class="mb-8bt">Tap "Add" in the top right</li>
        </ol>
      </div>
    {:else if params.isAndroid}
      <div class="text-base-sm mb-20up text-center max-w-500up">
        <p class="mb-12bt font-semibold">Android instructions:</p>
        <ol class="text-left list-decimal list-inside">
          <li class="mb-8bt">Tap the menu (three dots)</li>
          <li class="mb-8bt">Tap "Add to Home screen" or "Install app"</li>
          <li class="mb-8bt">Tap "Add" or "Install"</li>
        </ol>
      </div>
    {/if}

    <p class="text-base-xs text-surface-600 mt-20up">
      Device: {params.isIos ? 'iOS' : params.isAndroid ? 'Android' : 'Other'}
      {#if params.isIpadOS}(iPad){/if}
    </p>
  </div>
{/snippet}

<GameBox
  classes="border-4 border-success-500"
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
  {snippetInstallOnHomeScreen}
/>
