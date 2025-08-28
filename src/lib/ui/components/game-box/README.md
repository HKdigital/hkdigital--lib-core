# GameBox Component

A responsive container component designed for creating games and fullscreen
applications with adaptive scaling, orientation handling, and mobile PWA
support.

## Features

- **Responsive Layout**: Automatically adapts to landscape and portrait
  orientations
- **Aspect Ratio Control**: Configurable aspect ratios for different
  orientations
- **Mobile PWA Support**: Handles iOS Safari PWA quirks and fullscreen modes
- **Dynamic Scaling**: Optional design system scaling based on container size
- **Fullscreen Management**: Built-in fullscreen request handling
- **Device Detection**: Automatic mobile and OS detection

## Basic Usage

```svelte
<script>
  import { GameBox } from '$lib/ui/components/game-box/index.js';
</script>

<GameBox
  aspectOnLandscape={16/9}
  aspectOnPortrait={9/16}
  snippetLandscape={landscapeContent}
  snippetPortrait={portraitContent}
/>

{#snippet landscapeContent({ gameWidth, gameHeight, isMobile })}
  <div>Game content for landscape - {gameWidth}x{gameHeight}</div>
{/snippet}

{#snippet portraitContent({ gameWidth, gameHeight, isMobile })}
  <div>Game content for portrait - {gameWidth}x{gameHeight}</div>
{/snippet}
```

## Props

### Styling Props
- `base?: string` - Base CSS classes
- `bg?: string` - Background CSS classes  
- `classes?: string` - Additional CSS classes
- `style?: string` - Inline styles

### Layout Props
- `aspectOnLandscape?: number` - Aspect ratio for landscape mode (e.g., 16/9)
- `aspectOnPortrait?: number` - Aspect ratio for portrait mode (e.g., 9/16)
- `marginLeft?: number` - Left margin in pixels (default: 0)
- `marginRight?: number` - Right margin in pixels (default: 0)
- `marginTop?: number` - Top margin in pixels (default: 0)
- `marginBottom?: number` - Bottom margin in pixels (default: 0)
- `center?: boolean` - Center the game box in viewport

### Scaling Props
- `enableScaling?: boolean` - Enable design system scaling (default: false)
- `designLandscape?: {width: number, height: number}` - Design dimensions
  for landscape (default: {width: 1920, height: 1080})
- `designPortrait?: {width: number, height: number}` - Design dimensions
  for portrait (default: {width: 1920, height: 1080})
- `clamping?: object` - Scaling limits for different elements

### Snippet Props
- `snippetLandscape?: Snippet` - Content for landscape orientation
- `snippetPortrait?: Snippet` - Content for portrait orientation
- `snippetRequireFullscreen?: Snippet` - Content when fullscreen is required
- `snippetInstallOnHomeScreen?: Snippet` - Content for home screen install
  prompt

## Snippet Parameters

All snippets receive these parameters:

```js
{
  isMobile: boolean,          // Is running on mobile device
  os: 'Android'|'iOS',        // Operating system
  isFullscreen: boolean,      // Is in fullscreen mode
  isDevMode: boolean,         // Is in development mode
  requestDevmode: function,   // Function to enable dev mode
  requestFullscreen: function, // Function to request fullscreen
  gameWidth: number,          // Calculated game width
  gameHeight: number          // Calculated game height
}
```

## Examples

### Simple Game Container

```svelte
<GameBox
  aspectOnLandscape={16/9}
  aspectOnPortrait={9/16}
  center={true}
  snippetLandscape={gameContent}
  snippetPortrait={gameContent}
/>

{#snippet gameContent({ gameWidth, gameHeight })}
  <div class="game-area bg-surface-900 rounded-lg p-20up">
    <h1 class="type-heading-h1 text-center mb-20up">My Game</h1>
    <div class="game-content" style="width: 100%; height: 100%;">
      Game content goes here
    </div>
  </div>
{/snippet}
```

### With Fullscreen Requirement

```svelte
<GameBox
  aspectOnLandscape={21/9}
  center={true}
  snippetLandscape={gameContent}
  snippetRequireFullscreen={fullscreenPrompt}
/>

{#snippet gameContent({ gameWidth, gameHeight, isFullscreen })}
  <div class="cinematic-game">
    Ultra-wide cinematic game experience
  </div>
{/snippet}

{#snippet fullscreenPrompt({ requestFullscreen })}
  <div class="fullscreen-prompt text-center">
    <h2 class="type-heading-h2 mb-16bt">Fullscreen Required</h2>
    <p class="type-base-md mb-20bt">
      This game requires fullscreen mode for the best experience.
    </p>
    <button class="btn-primary" onclick={requestFullscreen}>
      Enter Fullscreen
    </button>
  </div>
{/snippet}
```

### With Scaling Enabled

```svelte
<GameBox
  aspectOnLandscape={16/9}
  enableScaling={true}
  designLandscape={{ width: 1920, height: 1080 }}
  clamping={{
    ui: { min: 0.5, max: 1.5 },
    textBase: { min: 0.8, max: 1.2 },
    textHeading: { min: 0.75, max: 2 },
    textUi: { min: 0.6, max: 1.1 }
  }}
  snippetLandscape={scaledContent}
/>

{#snippet scaledContent()}
  <div class="game-ui">
    <!-- UI elements will automatically scale based on container size -->
    <div class="hud">
      <span class="type-ui-sm">Score: 1000</span>
    </div>
  </div>
{/snippet}
```

### Mobile-Specific Handling

```svelte
<GameBox
  aspectOnLandscape={16/9}
  aspectOnPortrait={9/16}
  snippetLandscape={landscapeGame}
  snippetPortrait={portraitGame}
  snippetInstallOnHomeScreen={installPrompt}
/>

{#snippet landscapeGame({ isMobile, os })}
  <div class="landscape-game">
    {#if isMobile}
      <div class="mobile-controls">
        <!-- Touch controls for mobile -->
      </div>
    {:else}
      <div class="desktop-controls">
        <!-- Keyboard/mouse controls for desktop -->
      </div>
    {/if}
  </div>
{/snippet}

{#snippet portraitGame({ isMobile })}
  <div class="portrait-game">
    <!-- Optimized for portrait mobile gameplay -->
  </div>
{/snippet}

{#snippet installPrompt({ os })}
  <div class="install-prompt text-center">
    <h2 class="type-heading-h2 mb-16bt">Install App</h2>
    <p class="type-base-md mb-20bt">
      {#if os === 'iOS'}
        Tap the share button and select "Add to Home Screen"
      {:else}
        Install this app for the best gaming experience
      {/if}
    </p>
  </div>
{/snippet}
```

## CSS Custom Properties

The component exposes these CSS custom properties:

- `--game-width`: Current game width in pixels
- `--game-height`: Current game height in pixels

These can be used in your CSS for responsive styling:

```css
.game-element {
  width: calc(var(--game-width) * 0.5);
  height: calc(var(--game-height) * 0.2);
}
```

## Mobile PWA Considerations

The component includes special handling for mobile PWAs:

- **iOS Safari PWA**: Handles viewport quirks and orientation changes
- **Fullscreen Detection**: Properly detects PWA fullscreen mode
- **Screen Orientation**: Listens for orientation changes and updates layout
- **No Scroll**: Automatically prevents scrolling when active

## Development Mode

The component automatically enables development mode when:
- Running on `localhost`
- Called via `requestDevmode()` function

In development mode, fullscreen and installation requirements are bypassed
for easier testing.
