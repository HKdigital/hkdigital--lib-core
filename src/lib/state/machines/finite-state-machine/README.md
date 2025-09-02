# FiniteStateMachine

A lightweight finite state machine implementation for JavaScript applications, designed to work seamlessly with Svelte 5 runes.

## Overview

The `FiniteStateMachine` class provides a simple yet powerful way to manage application state through well-defined states and transitions. It supports enter/exit callbacks, event-driven transitions, and debounced events.

## Basic Usage

```javascript
import { FiniteStateMachine } from '$lib/state/classes.js';

const machine = new FiniteStateMachine('idle', {
  idle: {
    start: 'running'
  },
  running: {
    pause: 'paused',
    stop: 'idle'
  },
  paused: {
    resume: 'running',
    stop: 'idle'
  }
});

// Check current state
console.log(machine.current); // 'idle'

// Send events to trigger transitions
machine.send('start');
console.log(machine.current); // 'running'

machine.send('pause');
console.log(machine.current); // 'paused'
```

## Constructor

```javascript
new FiniteStateMachine(initialState, states);
```

- `initialState`: The starting state (string)
- `states`: Object defining available states and their transitions

## State Definition

Each state can define:

- **Transitions**: Event name → target state
- **Enter callback**: `_enter` function called when entering the state
- **Exit callback**: `_exit` function called when leaving the state

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: {
    _enter: (transition) => {
      console.log('Entered idle state');
    },
    _exit: (transition) => {
      console.log('Leaving idle state');
    },
    start: 'running'
  },
  running: {
    _enter: (transition) => {
      console.log('Started running');
    },
    stop: 'idle'
  }
});
```

## Callback TransitionData

Enter and exit callbacks receive transition data about the state change:

```javascript
/** @typedef {import('./typedef.js').TransitionData} TransitionData */

// TransitionData structure:
{
  from: 'previousState',    // State being exited
  to: 'newState',          // State being entered
  event: 'eventName',      // Event that triggered transition
  args: []                 // Arguments passed to send()
}
```

### TypeScript/JSDoc Integration

For better type safety, import the type definitions:

```javascript
/** @typedef {import('./typedef.js').TransitionData} TransitionData */
/** @typedef {import('./typedef.js').OnEnterCallback} OnEnterCallback */
/** @typedef {import('./typedef.js').OnExitCallback} OnExitCallback */

/** @type {OnEnterCallback} */
const handleEnter = (currentState, transition) => {
  console.log(`Entering ${currentState} from ${transition.from}`);
};

/** @type {OnExitCallback} */
const handleExit = (currentState, transition) => {
  console.log(`Leaving ${currentState} to ${transition.to}`);
};

machine.onenter = handleEnter;
machine.onexit = handleExit;
```

## Methods

### `send(event, ...args)`

Triggers a state transition based on the event.

```javascript
machine.send('start');
machine.send('error', new Error('Something went wrong'));
```

Returns the current state after processing the event.

### `debounce(wait, event, ...args)`

Debounces event sending to prevent rapid-fire transitions.

```javascript
// Will only execute after 500ms of inactivity
await machine.debounce(500, 'search', query);
```

### `current` (getter)

Returns the current state as a string.

```javascript
console.log(machine.current); // 'idle'
```

## Advanced Features

### Wildcard States

Use `*` to define transitions available from any state:

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: {
    start: 'running'
  },
  running: {
    pause: 'paused'
  },
  paused: {
    resume: 'running'
  },
  '*': {
    reset: 'idle', // Available from any state
    error: 'error'
  },
  error: {
    reset: 'idle'
  }
});
```

### Same-State Transitions

Same-state transitions (e.g., `idle → idle`) do NOT trigger enter/exit
callbacks. The state remains unchanged.

```javascript
machine.send('reset'); // If already in 'idle', no callbacks are called
```

### Function Actions

Instead of target states, you can define function actions:

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: {
    log: () => {
      console.log('Logging from idle state');
      return 'idle'; // Stay in same state
    },
    start: 'running'
  },
  running: {
    stop: 'idle'
  }
});
```

## onenter and onexit Callbacks

The `onenter` and `onexit` callbacks provide a unified way to react to all state changes, designed to work reliably with Svelte's reactivity system:

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: { start: 'loading' },
  loading: { complete: 'loaded', error: 'error' },
  loaded: { reset: 'idle' },
  error: { retry: 'loading', reset: 'idle' }
});

machine.onexit = (currentState, transition) => {
  switch (currentState) {
    case 'loading':
      console.log('Leaving loading state...');
      // Cancel ongoing requests
      abortController?.abort();
      break;
    case 'loaded':
      console.log('Leaving loaded state...');
      // Cleanup resources
      releaseResources();
      break;
  }
};

machine.onenter = (currentState, transition) => {
  switch (currentState) {
    case 'loading':
      console.log('Started loading...');
      showSpinner();
      break;
    case 'loaded':
      console.log('Loading complete!');
      hideSpinner();
      break;
    case 'error':
      console.log('Loading failed');
      showError(transition.args[0]);
      break;
  }
};
```

### Callback Execution Order

The callbacks are executed in this specific order during state transitions:

1. **`onexit`** - Called before leaving current state
2. **`_exit`** - Individual state exit callback
3. **`_enter`** - Individual state enter callback
4. **`onenter`** - Called after entering new state

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: {
    _enter: () => console.log('2. idle _enter'),
    _exit: () => console.log('4. idle _exit'),
    start: 'loading'
  },
  loading: {
    _enter: () => console.log('5. loading _enter'),
    complete: 'loaded'
  }
});

machine.onexit = (currentState) => console.log(`3. onexit ${currentState}`);
machine.onenter = (currentState) => console.log(`6. onenter ${currentState}`);

// Initial state triggers _enter and onenter
// Output:
// 2. idle _enter
// 6. onenter idle

machine.send('start');
// Output:
// 3. onexit idle
// 4. idle _exit
// 5. loading _enter
// 6. onenter loading
```

### onexit vs onenter

- **`onexit`**: Called when leaving a state - perfect for cleanup, cancellation, resource release
- **`onenter`**: Called when entering a state - perfect for initialization, setup, starting processes
- **`_exit`/`_enter`**: Individual per-state callbacks, called during transition
- **All callbacks are optional**: Set to null if not needed

## Integration with Svelte Reactivity

When using FiniteStateMachine with Svelte's reactive derived state, use this pattern to avoid timing issues and ensure reliable state monitoring:

### Pattern: Separate onenter from Reactive Monitoring

**✅ Use `onexit` and `onenter` for immediate state actions:**

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: { start: 'loading' },
  loading: { complete: 'loaded' },
  loaded: { reset: 'idle' }
});

machine.onexit = (state) => {
  switch (state) {
    case 'loading':
      this.#cancelProcess(); // Cancel ongoing operations
      break;
    case 'loaded':
      this.#releaseResources(); // Cleanup when leaving
      break;
  }
};

machine.onenter = (label) => {
  switch (label) {
    case 'loading':
      this.#startProcess(); // Start async process immediately
      break;
    case 'loaded':
      this.#notifyComplete(); // Notify when complete
      break;
  }
  this.state = state; // Update public state
};
```

**✅ Use `$effect` for reactive state monitoring:**

```javascript
// Monitor derived/computed values and trigger transitions when conditions are met
$effect(() => {
  if (machine.current === 'loading') {
    // Check completion based on reactive derived values
    if (this.#itemsCompleted === this.#totalItems && this.#totalItems > 0) {
      machine.send('complete'); // Trigger transition when condition met
    }
  }
});
```

### Why This Pattern?

- **`onexit`**: Handles cleanup and teardown when leaving states
- **`onenter`**: Handles setup and initialization when entering states
- **`$effect`**: Handles reactive monitoring of derived/computed values over time
- **Avoids timing issues**: Doesn't check completion status immediately on state entry
- **Leverages Svelte reactivity**: Automatically responds to changes in reactive variables
- **Clean separation**: State machine handles discrete transitions, effects handle continuous monitoring
- **Complete lifecycle**: Full control over state entry and exit

### Use Cases for This Pattern:

- **Progress monitoring**: File uploads, multi-step processes
- **Derived state transitions**: Validation completion, multi-source loading
- **Real-time condition checking**: Monitoring reactive computed properties
- **Complex completion logic**: When completion depends on multiple reactive values

### Example: Multi-Task Processor

```javascript
export default class TaskProcessor {
  #machine = new FiniteStateMachine('idle', {
    idle: { start: 'processing' },
    processing: { complete: 'finished', error: 'failed' },
    finished: { reset: 'idle' },
    failed: { retry: 'processing', reset: 'idle' }
  });

  #tasks = $state([]);

  // Derived progress calculation
  #progress = $derived.by(() => {
    let completed = 0;
    for (const task of this.#tasks) {
      if (task.completed) completed++;
    }
    return { completed, total: this.#tasks.length };
  });

  constructor() {
    // onexit: Handle cleanup when leaving states
    this.#machine.onexit = (currentState) => {
      switch (currentState) {
        case 'processing':
          this.#cancelTasks(); // Cancel ongoing tasks if interrupted
          break;
      }
    };

    // onenter: Handle immediate state actions
    this.#machine.onenter = (currentState) => {
      switch (currentState) {
        case 'processing':
          this.#startAllTasks(); // Start processing immediately
          break;
        case 'finished':
          this.#notifyComplete(); // Cleanup/notify when done
          break;
      }
      this.state = currentState;
    };

    // $effect: Monitor reactive completion
    $effect(() => {
      if (this.#machine.current === 'processing') {
        const { completed, total } = this.#progress;
        if (completed === total && total > 0) {
          this.#machine.send('complete');
        }
      }
    });
  }
}
```

### Basic Component Integration

```javascript
// Component.svelte
<script>
  import { FiniteStateMachine } from '$lib/state/classes.js';

  const machine = new FiniteStateMachine('idle', {
    idle: { start: 'loading' },
    loading: { complete: 'loaded', error: 'error' },
    loaded: { reset: 'idle' },
    error: { retry: 'loading', reset: 'idle' }
  });

  // Reactive state updates
  $effect(() => {
    console.log('State changed to:', machine.current);
  });

  // Handle state-specific actions
  machine.onexit = (currentState) => {
    switch (currentState) {
      case 'loading':
        // Cancel any ongoing requests
        cancelRequests();
        break;
    }
  };

  machine.onenter = (currentState) => {
    switch (currentState) {
      case 'loading':
        loadData();
        break;
      case 'error':
        showErrorMessage();
        break;
    }
  };
</script>

<button onclick={() => machine.send('start')}>
  {machine.current === 'loading' ? 'Loading...' : 'Start'}
</button>
```

## Error Handling

Invalid transitions are handled gracefully with console warnings:

```javascript
const machine = new FiniteStateMachine('idle', {
  idle: { start: 'running' },
  running: { stop: 'idle' }
});

machine.send('invalidEvent'); // Logs warning, stays in current state
console.log(machine.current); // Still 'idle'
```

## Best Practices

1. **Clear state names**: Use descriptive state names like `loading`, `error`,
   `authenticated` rather than generic ones
2. **Minimal state count**: Keep the number of states manageable
3. **Explicit transitions**: Define all valid transitions explicitly
4. **Error states**: Include error states and recovery paths
5. **Callback cleanup**: Use exit callbacks to clean up resources

## Examples

### Loading State Machine

```javascript
const loader = new FiniteStateMachine('idle', {
  idle: {
    _enter: () => console.log('Ready to load'),
    load: 'loading'
  },
  loading: {
    _enter: () => console.log('Loading started'),
    _exit: () => console.log('Loading finished'),
    success: 'loaded',
    error: 'error'
  },
  loaded: {
    _enter: () => console.log('Data loaded successfully'),
    reload: 'loading',
    reset: 'idle'
  },
  error: {
    _enter: ({ args }) => console.error('Load failed:', args[0]),
    retry: 'loading',
    reset: 'idle'
  }
});
```

### Authentication State Machine

```javascript
const auth = new FiniteStateMachine('anonymous', {
  anonymous: {
    login: 'authenticating'
  },
  authenticating: {
    _enter: () => console.log('Checking credentials...'),
    success: 'authenticated',
    failure: 'anonymous'
  },
  authenticated: {
    _enter: (transition) => console.log('Welcome!'),
    logout: 'anonymous',
    expire: 'anonymous'
  }
});
```

## Testing

The state machine includes comprehensive tests covering:

- Basic state transitions
- Enter/exit callbacks
- Invalid transitions
- Same-state transitions
- Immediate state access
- Callback execution order

See `FiniteStateMachine.test.js` for detailed examples.
