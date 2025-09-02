# LoadingStateMachine

A specialized finite state machine designed for managing loading operations with comprehensive state tracking and error handling.

## Overview

`LoadingStateMachine` extends `FiniteStateMachine` to provide a standardized way to handle loading workflows. It includes predefined states for initial, loading, loaded, unloading, aborted, and error conditions.

## States

The machine defines eight primary states:

- **`INITIAL`** - Starting state, ready to begin loading
- **`LOADING`** - Currently loading data or resources
- **`LOADED`** - Successfully loaded, data available
- **`UNLOADING`** - Cleaning up or releasing resources
- **`ABORTING`** - Currently aborting loading operation
- **`ABORTED`** - Loading operation was aborted
- **`ERROR`** - An error occurred during loading
- **`TIMEOUT`** - Loading operation exceeded time limit

## Events

Available events to trigger state transitions:

- **`LOAD`** - Start loading operation
- **`LOADED`** - Mark loading as complete
- **`UNLOAD`** - Begin cleanup/unloading
- **`ABORT`** - Start aborting the loading operation
- **`ABORTED`** - Mark abort operation as complete
- **`ERROR`** - Signal an error occurred
- **`TIMEOUT`** - Signal operation has timed out
- **`INITIAL`** - Return to initial state

## Basic Usage

```javascript
import { LoadingStateMachine } from '$lib/state/machines.js';
import {
  // States
  STATE_INITIAL,
  STATE_LOADING,
  STATE_LOADED,
  STATE_ERROR,
  // Events
  LOAD,
  LOADED,
  ERROR,
  ABORT
} from '$lib/state/machines.js';

const loader = new LoadingStateMachine();

// Check initial state
console.log(loader.current); // STATE_INITIAL

// Start loading
loader.send(LOAD);
console.log(loader.current); // STATE_LOADING

// Complete successfully
loader.send(LOADED);
console.log(loader.current); // STATE_LOADED
```

## State Transitions

### Valid Transitions

```
INITIAL → LOADING
LOADING → LOADED | ABORTING | ERROR | TIMEOUT
LOADED → LOADING | UNLOADING
UNLOADING → INITIAL | ERROR
ABORTING → ABORTED | ERROR
ABORTED → LOADING | UNLOADING
ERROR → LOADING | UNLOADING
TIMEOUT → LOADING | UNLOADING
```

### Transition Diagram

```
    ┌─────────┐
    │ INITIAL │
    └────┬────┘
     LOAD│
         ▼
    ┌─────────┐            ABORT              ┌──────────┐
    │ LOADING │──────────────────────────────→│ ABORTING │
    └────┬────┘                               └─────┬────┘
         │                                          │
   LOADED│       ERROR        TIMEOUT      ABORTED  │ERROR
         │         │             │            │     │
         ▼         ▼             ▼            ▼     ▼
    ┌────────┐ ┌───────┐    ┌─────────┐     ┌─────────┐
    │ LOADED │ │ ERROR │    │ TIMEOUT │     │ ABORTED │
    └────┬───┘ └───┬───┘    └────┬────┘     └────┬────┘
         │         │             │               │
   UNLOAD│     LOAD│UNLOAD   LOAD│UNLOAD     LOAD│UNLOAD
         ▼         ▼             ▼               ▼
    ┌──────────┐                                 │
    │UNLOADING │◄────────────────────────────────┘
    └──────────┘
```

## onenter Callback

The `onenter` callback provides a reliable way to react to state changes, designed to work around Svelte's reactive batching behavior.

```javascript
const loader = new LoadingStateMachine();

loader.onenter = (currentState) => {
  switch (currentState) {
    case STATE_LOADING:
      console.log('Started loading...');
      showSpinner();
      break;
    case STATE_LOADED:
      console.log('Loading complete!');
      hideSpinner();
      break;
    case STATE_ERROR:
      console.log('Loading failed');
      showError();
      break;
    case STATE_TIMEOUT:
      console.log('Loading timed out');
      showRetryOption();
      break;
  }
};
```

### Why onenter?

The `onenter` callback was added because there might be issues when the stats machine is combined with Svelte's `$effect`. This callback ensures you can reliably respond to every state change.

```javascript
// Svelte $effect might miss rapid transitions
$effect(() => {
  console.log(loader.current); // May only see final state
});

// onenter catches every transition
loader.onenter = (currentState) => {
  console.log(currentState); // Sees every state change
};
```

## Error Handling

The machine includes sophisticated error handling with automatic error object creation:

```javascript
const loader = new LoadingStateMachine();

// Send error with Error object
loader.send(ERROR, new Error('Network failed'));
console.log(loader.error.message); // 'Network failed'

// Send error with error details
loader.send(ERROR, { error: 'Timeout occurred' });
console.log(loader.error.message); // 'Timeout occurred'

// Send error with just a string
loader.send(ERROR, { error: new Error('Parse error') });
console.log(loader.error.message); // 'Parse error'
```

The `error` getter provides access to the last error:

```javascript
if (loader.current === 'error') {
  console.error('Loading failed:', loader.error);
}
```

## Timeout Handling

The machine supports timeout functionality for managing loading operations that exceed expected duration:

```javascript
const loader = new LoadingStateMachine();

// External timeout management
const timeoutId = setTimeout(() => {
  if (loader.current === STATE_LOADING) {
    loader.timeout(); // Transitions to STATE_TIMEOUT
  }
}, 10000); // 10 second timeout

loader.onenter = (currentState) => {
  switch (currentState) {
    case STATE_TIMEOUT:
      console.log('Loading timed out');
      showRetryButton();
      break;
    case STATE_LOADED:
      clearTimeout(timeoutId); // Cancel timeout on success
      break;
  }
};
```

### timeout Method

Use `timeout()` to manually trigger a timeout transition:

```javascript
// Only works when in STATE_LOADING
loader.timeout(); // Sends TIMEOUT signal
```

### abort Method

Use `abort()` to manually trigger an abort transition:

```javascript
// Only works when in STATE_LOADING
loader.abort(); // Sends ABORT signal, transitions to STATE_ABORTING
```

## Integration with Svelte Reactivity

LoadingStateMachine inherits the `onenter` callback and Svelte reactivity integration patterns from [FiniteStateMachine](../finite-state-machine/README.md#integration-with-svelte-reactivity). 

### Quick Reference: Loading State Pattern

**✅ Use `onenter` for immediate loading actions:**
```javascript
const loader = new LoadingStateMachine();

loader.onenter = (currentState) => {
  switch (currentState) {
    case STATE_LOADING:
      this.#startLoading(); // Start async process immediately
      break;
    case STATE_LOADED:
      this.#cleanup(); // Cleanup when complete
      break;
    case STATE_ERROR:
      this.#handleError(); // Handle error state
      break;
  }
  this.state = state; // Update public state
};
```

**✅ Use `$effect` for reactive completion monitoring:**
```javascript
// Monitor derived/computed values and trigger transitions when conditions are met
$effect(() => {
  if (loader.current === STATE_LOADING) {
    // Check completion based on reactive derived values
    if (this.#sourcesLoaded === this.#numberOfSources && this.#numberOfSources > 0) {
      loader.send(LOADED); // Trigger transition when condition met
    }
  }
});
```

### Loading-Specific Example

```javascript
export default class MultiSourceLoader {
  #loader = new LoadingStateMachine();
  #sources = $state([]);
  
  // Derived progress calculation  
  #progress = $derived.by(() => {
    let completed = 0;
    for (const source of this.#sources) {
      if (source.loaded) completed++;
    }
    return { completed, total: this.#sources.length };
  });

  constructor() {
    // Handle immediate loading state actions
    this.#loader.onenter = (currentState) => {
      switch (currentState) {
        case STATE_LOADING:
          this.#startAllSources();
          break;
        case STATE_LOADED:
          this.#notifyComplete();
          break;
        case STATE_ERROR:
          this.#handleLoadError();
          break;
        case STATE_TIMEOUT:
          this.#handleTimeout();
          break;
      }
      this.state = currentState;
    };

    // Monitor reactive completion
    $effect(() => {
      if (this.#loader.current === STATE_LOADING) {
        const { completed, total } = this.#progress;
        if (completed === total && total > 0) {
          this.#loader.send(LOADED);
        }
      }
    });
  }
}
```

**📖 For complete documentation** of the `onenter` callback and Svelte reactivity patterns, see the [FiniteStateMachine README](../finite-state-machine/README.md#integration-with-svelte-reactivity).

### Basic Component Integration

```javascript
// LoadingComponent.svelte
<script>
  import { LoadingStateMachine } from '$lib/state/machines.js';
  import {
    STATE_LOADING,
    STATE_LOADED,
    STATE_ERROR,
    LOAD,
    LOADED,
    ERROR,
    ABORT
  } from '$lib/state/machines.js';
  
  const loader = new LoadingStateMachine();
  let data = $state(null);
  
  loader.onenter = (currentState) => {
    if (currentState === STATE_LOADING) {
      loadData();
    }
  };
  
  async function loadData() {
    try {
      const response = await fetch('/api/data');
      data = await response.json();
      loader.send(LOADED);
    } catch (error) {
      loader.send(ERROR, error);
    }
  }
</script>

<button onclick={() => loader.send(LOAD)} disabled={loader.current === STATE_LOADING}>
  {#if loader.current === STATE_LOADING}
    Loading...
  {:else}
    Load Data
  {/if}
</button>

{#if loader.current === STATE_LOADED}
  <div>Data loaded successfully!</div>
{:else if loader.current === STATE_ERROR}
  <div>Error: {loader.error.message}</div>
{/if}
```

### Advanced Component with Abort Handling

```javascript
<script>
  import { LoadingStateMachine } from '$lib/state/machines.js';
  import {
    STATE_INITIAL,
    STATE_LOADING,
    STATE_LOADED,
    STATE_ABORTING,
    STATE_ABORTED,
    STATE_ERROR,
    LOAD,
    LOADED,
    ERROR,
    ABORT,
    ABORTED
  } from '$lib/state/machines.js';
  
  const loader = new LoadingStateMachine();
  let abortController = null;
  
  loader.onenter = (currentState) => {
    switch (currentState) {
      case STATE_LOADING:
        startLoad();
        break;
      case STATE_ABORTING:
        // Start abort process
        abortController?.abort();
        // Simulate abort completion
        setTimeout(() => loader.send(ABORTED), 100);
        break;
    }
  };
  
  async function startLoad() {
    abortController = new AbortController();
    
    try {
      const response = await fetch('/api/slow-data', {
        signal: abortController.signal
      });
      const data = await response.json();
      loader.send(LOADED);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted, machine will transition to STATE_ABORTED
      } else {
        loader.send(ERROR, error);
      }
    }
  }
</script>

<div>
  {#if loader.current === STATE_INITIAL}
    <button onclick={() => loader.send(LOAD)}>Start Loading</button>
  {:else if loader.current === STATE_LOADING}
    <button onclick={() => loader.send(ABORT)}>Abort Loading</button>
    <div>Loading data...</div>
  {:else if loader.current === STATE_ABORTING}
    <div>Aborting...</div>
  {:else if loader.current === STATE_LOADED}
    <div>Data loaded successfully!</div>
    <button onclick={() => loader.send(LOAD)}>Reload</button>
  {:else if loader.current === STATE_ABORTED}
    <div>Loading aborted</div>
    <button onclick={() => loader.send(LOAD)}>Try Again</button>
  {:else if loader.current === STATE_ERROR}
    <div>Error: {loader.error.message}</div>
    <button onclick={() => loader.send(LOAD)}>Retry</button>
  {/if}
</div>
```

## Best Practices

### 1. Use onenter for Side Effects

```javascript
// ✅ Good - use onenter for reliable side effects
loader.onenter = (currentState) => {
  if (currentState === STATE_LOADING) {
    analytics.track('loading_started');
  }
};

// ❌ Avoid - $effect may miss rapid transitions
$effect(() => {
  if (loader.current === STATE_LOADING) {
    analytics.track('loading_started'); // May not fire
  }
});
```

### 2. Handle All Error States

```javascript
loader.onenter = (currentState) => {
  switch (currentState) {
    case STATE_ERROR:
      showErrorToast(loader.error.message);
      logError(loader.error);
      break;
    case STATE_ABORTING:
      showMessage('Aborting operation...');
      break;
    case STATE_ABORTED:
      showMessage('Operation aborted');
      break;
  }
};
```

### 3. Implement Proper Cleanup

```javascript
loader.onenter = (currentState) => {
  switch (currentState) {
    case STATE_LOADING:
      showProgressBar();
      break;
    case STATE_LOADED:
    case STATE_ERROR:
    case STATE_ABORTING:
    case STATE_ABORTED:
      hideProgressBar();
      break;
    case STATE_UNLOADING:
      cleanup();
      break;
  }
};
```

### 4. Use Constants for Events

```javascript
import {
  LOAD,
  LOADED,
  ERROR
} from '$lib/state/machines.js';

// ✅ Good - type safe and refactor friendly
loader.send(LOAD);

// ❌ Avoid - prone to typos
loader.send('load');
```

## Common Patterns

### Resource Loading with Cleanup

```javascript
const resourceLoader = new LoadingStateMachine();
let resource = null;

resourceLoader.onenter = async (currentState) => {
  switch (currentState) {
    case STATE_LOADING:
      try {
        resource = await loadResource();
        resourceLoader.send(LOADED);
      } catch (error) {
        resourceLoader.send(ERROR, error);
      }
      break;
      
    case STATE_UNLOADING:
      if (resource) {
        await resource.cleanup();
        resource = null;
      }
      resourceLoader.send(INITIAL);
      break;
  }
};
```

### Retry Logic

```javascript
const retryLoader = new LoadingStateMachine();
let retryCount = 0;
const maxRetries = 3;

retryLoader.onenter = async (currentState) => {
  switch (currentState) {
    case STATE_LOADING:
      try {
        await performLoad();
        retryCount = 0; // Reset on success
        retryLoader.send(LOADED);
      } catch (error) {
        retryLoader.send(ERROR, error);
      }
      break;
      
    case STATE_ERROR:
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          retryLoader.send(LOAD);
        }, 1000 * retryCount); // Exponential backoff
      }
      break;
  }
};
```

## Testing

The LoadingStateMachine includes comprehensive tests covering:

- All state transitions
- onenter callback functionality
- Error handling with different error types
- Null safety when no callback is set
- Dynamic callback changes

See `LoadingStateMachine.test.js` for detailed examples.

## Constants

Import state and event constants from the constants file:

```javascript
import {
  // States
  STATE_INITIAL,
  STATE_LOADING,
  STATE_LOADED,
  STATE_UNLOADING,
  STATE_ABORTING,
  STATE_ABORTED,
  STATE_ERROR,
  STATE_TIMEOUT,
  
  // Events
  LOAD,
  LOADED,
  UNLOAD,
  ABORT,
  ABORTED,
  ERROR,
  INITIAL,
  TIMEOUT
} from './constants.js';
```
