# ReactiveDataStore

Reactive key-value data store with fine-grained reactivity built on Svelte 5's
`SvelteMap`.

## Features

- **Fine-grained reactivity**: Effects only re-run when specific keys change
- **Strict mode**: Throws errors on uninitialized key access
- **Production guard**: Dev-only data mode for development helpers
- **Full CRUD API**: Set, get, update, delete, check existence, clear
- **Type-safe**: Use constants for keys to get autocomplete and typo prevention

## Basic Usage

```javascript
import { ReactiveDataStore } from '$lib/state/classes.js';

// Create a store
const store = new ReactiveDataStore({
  initialData: {
    score: 0,
    level: 1,
    playerName: 'Alice'
  }
});

// Set data
store.set('score', 100);

// Get data (reactive)
$effect(() => {
  const score = store.get('score');
  console.log('Score changed:', score);
});

// Update multiple values
store.update({
  score: 200,
  level: 5
});

// Check existence
if (store.has('score')) {
  // ...
}

// Get all data (snapshot)
const allData = store.getAll();

// Delete
store.delete('temporaryFlag');

// Clear all
store.clear();

// Get size
console.log(`Store has ${store.size} entries`);
```

## Options

```javascript
const store = new ReactiveDataStore({
  // Initial key-value pairs
  initialData: {},

  // Throw on uninitialized key access (default: true)
  strictMode: true,

  // Dev-only mode (default: false)
  productionGuard: false,

  // Custom error message prefix (default: 'Data key')
  errorPrefix: 'Custom prefix'
});
```

## Fine-Grained Reactivity

ReactiveDataStore uses `SvelteMap` internally, providing fine-grained
reactivity where effects only re-run when the specific keys they access change.

```javascript
const store = new ReactiveDataStore({
  initialData: { score: 0, lives: 3 }
});

// Effect 1: Only re-runs when 'score' changes
$effect(() => {
  const score = store.get('score');
  console.log('Score:', score);
});

// Effect 2: Only re-runs when 'lives' changes
$effect(() => {
  const lives = store.get('lives');
  console.log('Lives:', lives);
});

// This only triggers Effect 1, not Effect 2
store.set('score', 100);

// This only triggers Effect 2, not Effect 1
store.set('lives', 2);
```

## Strict Mode (Default)

By default, ReactiveDataStore throws errors when accessing uninitialized keys.
This helps catch typos and ensures data is properly initialized.

```javascript
const store = new ReactiveDataStore();

// ❌ Throws: "Data key "score" is not initialized."
store.get('score');

// ✅ Initialize first
store.set('score', 0);
store.get('score');  // Works

// Or initialize via constructor
const store2 = new ReactiveDataStore({
  initialData: { score: 0 }
});
store2.get('score');  // Works
```

### Disabling Strict Mode

```javascript
const store = new ReactiveDataStore({
  strictMode: false
});

// Returns undefined instead of throwing
const score = store.get('nonexistent');  // undefined
```

## Production Guard (Dev-Only Data)

Use `productionGuard: true` for development-only data that should not be
accessed in production.

```javascript
const devStore = new ReactiveDataStore({
  initialData: {
    autoNavigation: false,
    skipAnimations: false,
    mockApi: 'localhost'
  },
  productionGuard: true,
  errorPrefix: 'Dev data key'
});

// In development mode:
devStore.set('autoNavigation', true);    // ✅ Works
const value = devStore.get('autoNavigation');  // ✅ Works

// In production:
devStore.set('autoNavigation', true);    // ✅ Silent no-op (safe)
devStore.get('autoNavigation');          // ❌ Throws error (programming bug!)
```

**Why this design?**

- **SET operations**: Safe to call conditionally in production (no-op)
- **GET/HAS operations**: Reading dev data in production is a programming
  error that should fail fast

## Using with PageMachine

ReactiveDataStore is used internally by PageMachine for data management:

```javascript
import { PageMachine } from '$lib/state/machines.js';

const machine = new PageMachine({
  startPath: '/intro',
  initialData: {
    score: 0,
    tutorialSeen: false
  },
  initialDevData: {
    autoNav: false,
    skipAnimations: false
  }
});

// Access via read-only getters
machine.data.set('score', 100);
machine.data.get('score');

machine.devData.set('autoNav', true);
machine.devData.get('autoNav');
```

## Best Practices

### 1. Use Constants for Keys

Avoid magic strings - use constants for autocomplete and typo prevention:

```javascript
// ✅ Good - use constants
const KEY_SCORE = 'score';
const KEY_PLAYER_NAME = 'player-name';
const KEY_TUTORIAL_SEEN = 'tutorial-seen';

store.set(KEY_SCORE, 100);
const score = store.get(KEY_SCORE);

// ❌ Avoid - magic strings
store.set('score', 100);
const score = store.get('scroe');  // Typo! No error until runtime
```

### 2. Initialize Data in Constructor

Always initialize expected keys in the constructor for strict mode:

```javascript
// ✅ Good
const store = new ReactiveDataStore({
  initialData: {
    score: 0,
    lives: 3,
    playerName: ''
  }
});

// ❌ Avoid - uninitialized keys
const store = new ReactiveDataStore();
store.get('score');  // Throws error
```

### 3. Use Dev Data for Development Helpers

Keep development-only flags separate with production guard:

```javascript
// Regular data
const data = new ReactiveDataStore({
  initialData: {
    score: 0,
    level: 1
  }
});

// Dev-only data
const devData = new ReactiveDataStore({
  initialData: {
    autoNavigation: false,
    skipAnimations: false,
    debugMode: false
  },
  productionGuard: true,
  errorPrefix: 'Dev data key'
});
```

### 4. Use getAll() for Serialization Only

`getAll()` returns a snapshot (plain object), not a reactive value. Use it for
serialization or inspection, not for reactive tracking:

```javascript
// ✅ Good - serialization
const snapshot = store.getAll();
await saveToServer(snapshot);

// ✅ Good - inspection
console.log('Current state:', store.getAll());

// ❌ Avoid - for reactivity
$effect(() => {
  const data = store.getAll();  // Re-runs on ANY key change
  console.log(data.score);      // Use store.get('score') instead
});
```

## API Reference

### Constructor

```javascript
new ReactiveDataStore(options)
```

**Options:**
- `initialData` (object): Initial key-value pairs
- `strictMode` (boolean): Throw on uninitialized keys (default: `true`)
- `productionGuard` (boolean): Dev-only mode (default: `false`)
- `errorPrefix` (string): Error message prefix (default: `'Data key'`)

### Methods

#### `set(key, value)`

Set a data property value. Triggers reactivity for this key.

```javascript
store.set('score', 100);
```

#### `get(key)`

Get a data property value. Creates a reactive dependency on this key.

```javascript
const score = store.get('score');
```

**Throws:** Error if key not initialized (strict mode)

#### `getAll()`

Get all data as a plain object snapshot (not reactive).

```javascript
const snapshot = store.getAll();
```

#### `update(updates)`

Update multiple properties at once.

```javascript
store.update({
  score: 100,
  level: 5,
  lives: 2
});
```

#### `has(key)`

Check if a key exists.

```javascript
if (store.has('score')) {
  // Key exists
}
```

#### `delete(key)`

Delete a property.

```javascript
const deleted = store.delete('temporaryFlag');
```

**Returns:** `true` if key existed and was deleted

#### `clear()`

Clear all data properties.

```javascript
store.clear();
```

#### `size` (getter)

Get the number of data entries.

```javascript
console.log(`Store has ${store.size} entries`);
```

## Common Patterns

### Persisting to Server

```javascript
const store = new ReactiveDataStore({
  initialData: {
    score: 0,
    level: 1,
    preferences: {}
  }
});

// Save snapshot to server
async function saveProgress() {
  const data = store.getAll();
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Load from server
async function loadProgress() {
  const response = await fetch('/api/load');
  const data = await response.json();
  store.update(data);
}
```

### Computed Values

```javascript
const store = new ReactiveDataStore({
  initialData: {
    score: 0,
    multiplier: 1
  }
});

// Computed value based on store data
const totalScore = $derived(
  store.get('score') * store.get('multiplier')
);
```

### Conditional Effects

```javascript
const store = new ReactiveDataStore({
  initialData: {
    level: 1,
    lives: 3
  }
});

// Effect only runs when level changes and lives > 0
$effect(() => {
  const level = store.get('level');
  const lives = store.get('lives');

  if (lives > 0) {
    console.log(`Playing level ${level}`);
  }
});
```

## See Also

- [PageMachine](../../machines/page-machine/README.md) - Uses ReactiveDataStore
  for route-aware data management
- [SubscribersCount](../subscribers-count/SubscribersCount.js) - Another state
  utility class
