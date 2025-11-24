<script>
  import GameBox from './GameBox.svelte';

  const props = $props();
</script>

<GameBox {...props}>
  {#snippet snippetPortrait(params)}
    <div data-testid="portrait-content" data-orientation="portrait">
      Portrait View
      <span data-testid="is-portrait">{params.isPortrait}</span>
      <span data-testid="is-landscape">{params.isLandscape}</span>
      <span data-testid="game-width">{params.gameWidth}</span>
      <span data-testid="game-height">{params.gameHeight}</span>
    </div>
  {/snippet}

  {#snippet snippetLandscape(params)}
    <div data-testid="landscape-content" data-orientation="landscape">
      Landscape View
      <span data-testid="is-portrait">{params.isPortrait}</span>
      <span data-testid="is-landscape">{params.isLandscape}</span>
      <span data-testid="game-width">{params.gameWidth}</span>
      <span data-testid="game-height">{params.gameHeight}</span>
    </div>
  {/snippet}

  {#snippet snippetRequireFullscreen(params)}
    <div data-testid="require-fullscreen">
      <p>Please enter fullscreen mode</p>
      <button data-testid="fullscreen-button" onclick={params.requestFullscreen}>
        Enter Fullscreen
      </button>
    </div>
  {/snippet}

  {#snippet snippetInstallOnHomeScreen(params)}
    <div data-testid="install-home-screen">
      <p>Please install this app on your home screen</p>
      <p data-testid="os-type">{params.os}</p>
    </div>
  {/snippet}
</GameBox>
