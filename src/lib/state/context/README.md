# RouteStateContext

Base class for route-level state containers.

## How it connects

```
┌─────────────────────────────────────────────────────────┐
│ PuzzleState (extends RouteStateContext)                 │
│ - Container for route-level concerns                    │
│ - Contains PageMachine instance                         │
│ - Optional: services, preload, reset, etc.              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Provided via Svelte context
                 │
┌────────────────▼────────────────────────────────────────┐
│ +layout.svelte                                          │
│ - Creates state with createOrGetPuzzleState()           │
│ - IMPORTANT: Syncs URL with pageMachine.syncFromPath()  │
│ - Optional: Calls validateAndRedirect() for protection  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Context available to children
                 │
        ┌────────┴─────────┬────────────────┐
        ▼                  ▼                ▼
  ┌──────────┐      ┌──────────┐    ┌──────────┐
  │ +page    │      │ +page    │    │ Component│
  │ .svelte  │      │ .svelte  │    │          │
  └──────────┘      └──────────┘    └──────────┘
  Gets state via getPuzzleState()
```

## Main Purposes

1. **State container** - Hold route-level concerns in one place
2. **Apply enforceStartPath** - Control navigation flow (users must visit
   start path before accessing subroutes)
3. **Provide validateAndRedirect** - Route protection via layout

## Key Features

- Share state between layout and pages without prop drilling
- Persist state across navigation within the same route group
- Lifecycle methods for setup/teardown (preload, reset)

## Basic Usage

### 1. Create state container class

```javascript
// routes/puzzle/puzzle.state.svelte.js
import { defineStateContext } from '@hkdigital/lib-core/state/context.js';
import { RouteStateContext } from '$lib/state/context.js';
import PuzzlePageMachine from './puzzle.machine.svelte.js';

export class PuzzleState extends RouteStateContext {
  #pageMachine;

  constructor() {
    super({
      startPath: '/puzzle',
      enforceStartPath: true  // Optional: enforce route protection
    });
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
    // Reset state when needed
  }
}

// Export helper functions
export const [createOrGetPuzzleState, createPuzzleState, getPuzzleState] =
  defineStateContext(PuzzleState);
```

### 2. Provide context in layout

```svelte
<!-- routes/puzzle/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import { createOrGetPuzzleState } from './puzzle.state.svelte.js';

  // Create or get existing state container
  const puzzleState = createOrGetPuzzleState();

  // IMPORTANT: Sync URL with PageMachine state
  $effect(() => {
    puzzleState.pageMachine.syncFromPath($page.url.pathname);
  });

  // Optional: Enforce start path (redirect if user skips intro)
  $effect(() => {
    puzzleState.validateAndRedirect($page.url.pathname);
  });

  // Optional: Preload assets
  puzzleState.preload((progress) => {
    console.log('Loading:', progress);
  });
</script>

<slot />
```

### 3. Consume context in pages

```svelte
<!-- routes/puzzle/level1/+page.svelte -->
<script>
  import { getPuzzleState } from '../puzzle.state.svelte.js';

  const puzzleState = getPuzzleState();
  const pageMachine = puzzleState.pageMachine;
</script>

<div>Current state: {pageMachine.current}</div>
```

## Context Helpers

The `defineStateContext` helper creates three functions:

```javascript
// Get existing or create new (use in layout)
const state = createOrGetPuzzleState();

// Force create new instance
const state = createPuzzleState();

// Get existing (throws if not found, use in pages/components)
const state = getPuzzleState();
```

## Constructor Options

```javascript
constructor({ startPath, enforceStartPath })
```

- `startPath` **(required)** - The start path for this route
  (e.g., `/puzzle`)
- `enforceStartPath` **(optional, default: false)** - If true, users must
  visit the start path before accessing subroutes

## validateAndRedirect Method

Automatically redirects users if they try to access subroutes before visiting
the start path.

**How it works:**
- If `enforceStartPath: true` is set in constructor
- User tries to access a subroute (e.g., `/puzzle/level2`)
- But hasn't visited the start path yet (`/puzzle`)
- → Automatically redirects to start path

**Example use case:** Puzzle game where users must see the intro before
accessing puzzle levels.

```javascript
// In state constructor
export class PuzzleState extends RouteStateContext {
  constructor() {
    super({
      startPath: '/puzzle',
      enforceStartPath: true
    });
  }
}
```

```svelte
<!-- In +layout.svelte -->
<script>
  import { page } from '$app/stores';

  const puzzleState = createOrGetPuzzleState();

  // Enforce route protection
  $effect(() => {
    puzzleState.validateAndRedirect($page.url.pathname);
  });
</script>
```

**Result:** If user navigates directly to `/puzzle/level2`, they'll be
redirected to `/puzzle` first. After visiting `/puzzle`, they can freely
navigate to any subroute.

**Custom redirect URL:**
```javascript
// Redirect to a different URL instead of startPath
puzzleState.validateAndRedirect($page.url.pathname, '/puzzle/welcome');
```

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
- Visited states
- Computed properties for state checks
