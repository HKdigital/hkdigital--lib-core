# State Context Utilities

Helper functions for managing Svelte context in route-level state containers.

## defineStateContext

Creates context helper functions for a state container class.

```javascript
import { defineStateContext } from '@hkdigital/lib-core/state/context.js';

class PuzzleState {
  #pageMachine;

  constructor() {
    this.#pageMachine = new PuzzlePageMachine();
  }

  get pageMachine() {
    return this.#pageMachine;
  }
}

// Export helper functions
export const [createOrGetPuzzleState, createPuzzleState, getPuzzleState] =
  defineStateContext(PuzzleState);
```

## Helper Functions

The `defineStateContext` helper creates three functions:

### createOrGetPuzzleState()

Get existing instance or create new one. Use in `+layout.svelte`.

```javascript
// routes/puzzle/+layout.svelte
const state = createOrGetPuzzleState();
```

### createPuzzleState()

Force create new instance (discards existing).

```javascript
const state = createPuzzleState();
```

### getPuzzleState()

Get existing instance. Throws error if not found. Use in pages/components.

```javascript
// routes/puzzle/level1/+page.svelte
const state = getPuzzleState();
```

## Complete Example

```javascript
// routes/puzzle/puzzle.state.svelte.js
import { defineStateContext } from '@hkdigital/lib-core/state/context.js';
import PuzzlePageMachine from './puzzle.machine.svelte.js';

export class PuzzleState {
  #pageMachine;

  constructor() {
    this.#pageMachine = new PuzzlePageMachine();
  }

  get pageMachine() {
    return this.#pageMachine;
  }

  // Optional: Service accessors
  getPuzzleService() {
    return getPuzzleService();
  }

  // Optional: Lifecycle methods
  preload(onProgress) {
    return loadPuzzleAssets(onProgress);
  }

  reset() {
    this.#pageMachine = new PuzzlePageMachine();
  }
}

export const [createOrGetPuzzleState, createPuzzleState, getPuzzleState] =
  defineStateContext(PuzzleState);
```

```svelte
<!-- routes/puzzle/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import { createOrGetPuzzleState } from './puzzle.state.svelte.js';

  const puzzleState = createOrGetPuzzleState();
  const pageMachine = puzzleState.pageMachine;

  // IMPORTANT: Sync URL with PageMachine state
  $effect(() => {
    pageMachine.syncFromPath($page.url.pathname);
  });

  // Optional: Preload assets
  puzzleState.preload((progress) => {
    console.log('Loading:', progress);
  });
</script>

<slot />
```

```svelte
<!-- routes/puzzle/level1/+page.svelte -->
<script>
  import { getPuzzleState } from '../puzzle.state.svelte.js';

  const puzzleState = getPuzzleState();
  const pageMachine = puzzleState.pageMachine;
</script>

<div>Current state: {pageMachine.current}</div>
```

## Key Features

- Share state between layout and pages without prop drilling
- Persist state across navigation within the same route group
- Lifecycle methods for setup/teardown (preload, reset)
- PageMachine integration for route/state management

## Separation of Concerns

**State Container** = Route-level concerns (MULTIPLE responsibilities)
- PageMachine instance
- Game engines
- Service accessors
- Media preloading
- Any other route-level concern

**PageMachine** = Page/view state ONLY (SINGLE responsibility)
- Current page state
- Route mapping
- Start path management
- Visited states
- Computed properties for state checks
