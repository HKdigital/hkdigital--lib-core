# Audio Loaders

Audio loading and scene management for web applications using the Web Audio API.

## Overview

The audio loading system consists of two main components:

- **AudioLoader** - Loads individual audio files from network sources
- **AudioScene** - Manages collections of audio sources with centralized playback control

## AudioScene

`AudioScene` extends `SceneBase` to provide audio-specific functionality including volume control, muting, and Web Audio API integration.

### Key Features

- **Scene-wide volume control** via gain nodes
- **Mute/unmute functionality** with volume restoration
- **Web Audio API integration** for precise audio control
- **Multiple audio source management** with unified loading states
- **Audio context management** with automatic creation or custom injection

### Audio Context Usage

AudioScene uses the Web Audio API's `AudioContext` for advanced audio processing:

```javascript
const audioScene = new AudioScene();

// Option 1: Use automatic context creation (default)
audioScene.load(); // Creates AudioContext internally

// Option 2: Provide your own context for integration
const customContext = new AudioContext();
audioScene.setAudioContext(customContext);
```

### Volume Control (Target Gain)

The scene uses a "target gain" system based on Web Audio API's gain scheduling:

- **Target Gain**: The desired volume level that the audio system transitions towards
  - `0.0` = silence (muted)
  - `1.0` = original volume  
  - `> 1.0` = amplified (use carefully to avoid distortion)

**Why "Target"?**
The Web Audio API allows smooth transitions between gain values over time. When you set a target gain, the audio system can gradually transition from the current level to the target level, preventing audio pops and clicks.

```javascript
// Set immediate volume change to 50%
audioScene.setTargetGain(0.5);

// Future: Could support smooth transitions
// gainNode.gain.setTargetAtTime(0.5, audioContext.currentTime, 0.3);

// Get current target volume
const volume = audioScene.getTargetGain(); // 0.5

// Mute (remembers previous volume)
audioScene.mute();

// Restore previous volume
audioScene.unmute();
```

The current implementation sets gain immediately, but the "target" naming prepares for potential smooth volume transitions in future versions.

### Audio Source Management

Define audio sources before loading:

```javascript
// Add audio sources
audioScene.defineMemorySource({
  label: 'background-music',
  url: '/audio/bg-music.mp3'
});

audioScene.defineMemorySource({
  label: 'sound-effect',
  url: '/audio/beep.wav'
});

// Load all sources
audioScene.load();

// Wait for loading completion
await waitForState(() => audioScene.loaded);
```

### Playback

Get playable audio sources after loading:

```javascript
// Get a source node for one-time playback
const sourceNode = await audioScene.getSourceNode('sound-effect');

// Play immediately
sourceNode.start();

// Play with delay
sourceNode.start(audioContext.currentTime + 0.5);

// Cleanup is automatic when playback ends
```

### Web Audio API Architecture

```
AudioSources → GainNode → AudioContext.destination → Speakers
                  ↑
            Volume Control
```

Each audio source connects through a gain node that provides scene-wide volume control before reaching the audio output.

### State Management

AudioScene inherits state management from SceneBase:

- `STATE_INITIAL` - Scene created, sources defined
- `STATE_LOADING` - Audio files downloading
- `STATE_LOADED` - All sources ready for playback
- `STATE_ABORTING` - Canceling downloads
- `STATE_ABORTED` - Downloads canceled

### Preloading with Progress and Abort

AudioScene supports convenient preloading with automatic progress tracking:

```javascript
// Basic preload - returns promise and abort function
const { promise, abort } = audioScene.preload();

// Preload with options
const { promise, abort } = audioScene.preload({
  timeoutMs: 5000,  // Timeout after 5 seconds
  onProgress: (progress) => {
    console.log(`Loading: ${progress.sourcesLoaded}/${progress.numberOfSources}`);
    console.log(`Bytes: ${progress.totalBytesLoaded}/${progress.totalSize}`);
  }
});

// Wait for completion
try {
  const loadedScene = await promise;
  console.log('All audio loaded successfully!');
} catch (error) {
  console.error('Preload failed:', error.message);
}

// Can abort anytime
document.getElementById('cancelBtn').onclick = () => abort();
```

**Preload Features:**
- **Promise-based**: Returns `{ promise, abort }` object
- **Progress tracking**: Optional callback with loading progress
- **Timeout support**: Configurable timeout with automatic abort
- **Manual abort**: Call `abort()` function to cancel loading
- **Error handling**: Promise rejects on timeout, abort, or loading errors

### Progress Tracking

Monitor loading progress across all sources:

```javascript
const progress = audioScene.progress;
console.log(`${progress.sourcesLoaded}/${progress.numberOfSources} loaded`);
console.log(`${progress.totalBytesLoaded}/${progress.totalSize} bytes`);
```

## Best Practices

1. **Audio Context Lifecycle**: Create AudioContext in response to user interaction to avoid browser autoplay restrictions

2. **Memory Management**: Audio sources are loaded into memory - consider file sizes for mobile devices

3. **Source Node Usage**: Each `getSourceNode()` call creates a new playable instance - don't reuse source nodes

4. **Volume Levels**: Keep target gain ≤ 1.0 to avoid audio clipping and distortion

5. **Error Handling**: Check scene state before attempting playback

```javascript
if (audioScene.loaded) {
  const source = await audioScene.getSourceNode('audio-label');
  source.start();
} else {
  console.warn('Audio scene not ready for playback');
}
```
