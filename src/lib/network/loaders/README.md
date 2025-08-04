# Media Loaders

Advanced media loading and processing classes for audio and images with loading state management, streaming support, and responsive image handling.

## Quick Start

```javascript
import * as image from '$lib/network/loaders.js';
import * as audio from '$lib/network/loaders.js';
```

## Image Loaders

### ImageLoader

Loads single images with chunked streaming and loading states.

```javascript
import { ImageLoader } from '$lib/network/loaders.js';

// Create image loader with single image or responsive variants
const imageSource = { src: '/path/to/image.jpg', width: 800, height: 600 };
const imageLoader = new ImageLoader({ imageSource });

// Start loading
imageLoader.load();

// Access loading states
console.log(imageLoader.loading); // true while loading
console.log(imageLoader.loaded);  // true when complete
console.log(imageLoader.error);   // error object if failed

// Get object URL when loaded
if (imageLoader.loaded) {
  const objectURL = imageLoader.getObjectURL();
  // Use objectURL in img src
}
```

### ImageVariantsLoader

Loads responsive image variants, automatically selecting the best size for container dimensions.

```javascript
import { ImageVariantsLoader } from '$lib/network/loaders.js';

const loader = new ImageVariantsLoader();

// Load responsive variants
const imageSource = [
  { src: '/image-400.jpg', width: 400, height: 300 },
  { src: '/image-800.jpg', width: 800, height: 600 },
  { src: '/image-1200.jpg', width: 1200, height: 900 }
];

await loader.load({
  imageSource,
  containerWidth: 600,
  containerHeight: 400,
  fit: 'cover', // or 'contain', 'fill'
  devicePixelRatio: window.devicePixelRatio
});
```

### ImageScene

High-level loader that manages multiple image sources with loading states.

```javascript
import { ImageScene } from '$lib/network/loaders.js';

const imageScene = new ImageScene();

// Configure multiple image sources
imageScene.updateSources({
  'thumbnail': { src: '/thumb.jpg', width: 200, height: 150 },
  'full': { src: '/full.jpg', width: 1920, height: 1080 }
});

// Load specific source
imageScene.load('full');

// Monitor state changes
imageScene.state; // 'initial', 'loading', 'loaded', 'error'
```

## Audio Components

### AudioLoader

Loads audio files with streaming support and loading state management.

```javascript
import { AudioLoader } from '$lib/network/loaders.js';

const audioLoader = new AudioLoader({
  url: '/path/to/audio.mp3'
});

// Start loading
audioLoader.load();

// Access audio data when loaded
if (audioLoader.loaded) {
  const audioBuffer = audioLoader.getAudioBuffer();
  const objectURL = audioLoader.getObjectURL();
}
```

### AudioScene

Manages multiple audio sources with scene-based loading.

```javascript
import { AudioScene } from '$lib/network/loaders.js';

const audioScene = new AudioScene();

// Configure audio sources
audioScene.updateSources({
  'background': { url: '/bg-music.mp3' },
  'sfx': { url: '/sound-effect.wav' }
});

// Load and play audio
audioScene.load('background');
```

## Image Utilities

### Responsive Image Helpers

```javascript
import { 
  toSingleImageMeta, 
  calculateEffectiveWidth 
} from '$lib/network/loaders/image/utils/index.js';

// Extract single image from array of variants
const imageMeta = toSingleImageMeta([
  { src: '/small.jpg', width: 400, height: 300 },
  { src: '/large.jpg', width: 800, height: 600 }
]); // Returns the largest (last) image

// Calculate optimal width for container
const effectiveWidth = calculateEffectiveWidth({
  containerWidth: 600,
  containerHeight: 400,
  imageAspectRatio: 16/9,
  fit: 'contain' // or 'cover', 'fill'
});
```

## Loading States

All loaders implement consistent loading state management:

- **`initial`** - Not started loading
- **`loading`** - Currently loading 
- **`loaded`** - Successfully loaded
- **`error`** - Failed to load
- **`cancelled`** - Loading was cancelled

## Integration with SvelteKit

### Using in Components

```svelte
<script>
  import { ImageLoader } from '$lib/network/loaders.js';
  import { onMount } from 'svelte';

  let imageLoader = $state();
  let objectURL = $state();

  const imageMeta = { src: '/image.jpg', width: 800, height: 600 };

  onMount(() => {
    imageLoader = new ImageLoader({ imageMeta });
    imageLoader.load();
  });

  $effect(() => {
    if (imageLoader?.loaded) {
      objectURL = imageLoader.getObjectURL();
    }

    return () => {
      if (objectURL) {
        URL.revokeObjectURL(objectURL);
      }
    };
  });
</script>

{#if objectURL}
  <img src={objectURL} alt="Loaded image" />
{:else if imageLoader?.loading}
  <p>Loading...</p>
{:else if imageLoader?.error}
  <p>Error: {imageLoader.error.message}</p>
{/if}
```

### Responsive Images

```svelte
<script>
  import { ImageBox } from '$lib/ui/components/index.js';
  
  // ImageBox uses ImageVariantsLoader internally
  const imageSource = [
    { src: '/image-400.jpg', width: 400, height: 300 },
    { src: '/image-800.jpg', width: 800, height: 600 }
  ];
</script>

<ImageBox 
  imageSource={imageSource}
  width="600px"
  height="400px"
  fit="cover"
/>
```

## Error Handling

```javascript
try {
  const imageLoader = new ImageLoader({ imageMeta });
  await imageLoader.load();
  
  if (imageLoader.error) {
    console.error('Loading failed:', imageLoader.error);
  }
} catch (error) {
  console.error('Setup failed:', error);
}
```

## Available Exports

### Image (`$lib/network/loaders.js`)
- `ImageLoader` - Single image loading with streaming
- `ImageVariantsLoader` - Responsive image variant selection

### Audio (`$lib/network/loaders.js`) 
- `AudioLoader` - Audio file loading with streaming
- `AudioScene` - Multi-source audio management

### Utilities (`$lib/network/loaders/image/utils/`)
- `toSingleImageMeta()` - Extract single image from variants
- `calculateEffectiveWidth()` - Calculate optimal image dimensions

All loaders provide built-in loading states, error handling, and memory management with automatic cleanup of object URLs.