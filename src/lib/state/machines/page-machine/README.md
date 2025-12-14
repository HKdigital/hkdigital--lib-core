# PageMachine

State machine for managing page view states with URL route mapping.

## How it connects

```
┌─────────────────────────────────────────────────────────┐
│ PuzzleState (extends PageMachine)                       │
│ - Maps states to URL routes                             │
│ - Tracks current state and visited states               │
│ - Manages start path and navigation                     │
│ - Provides computed properties (inIntro, inLevel1, etc.)│
│ - Contains GameLogic for reactive game state            │
│ - Optional: services, preload, reset, etc.              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Context provided to layout
                 │
┌────────────────▼────────────────────────────────────────┐
│ +layout.svelte                                          │
│ IMPORTANT: Must sync URL with state:                    │
│   $effect(() => {                                       │
│     puzzleState.syncFromPath($page.url.pathname);       │
│   });                                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Pages use state directly
                 │
        ┌────────┴─────────┬────────────────┐
        ▼                  ▼                ▼
  ┌──────────┐      ┌──────────┐    ┌──────────┐
  │ +page    │      │ +page    │    │ Component│
  │          │      │          │    │          │
  └──────────┘      └──────────┘    └──────────┘
  Access via: puzzleState.current, puzzleState.inIntro, etc.
```

## Main Purposes

1. **Track current view/step** - Which page is active
2. **Map states to URL paths** - Connect state names to routes
3. **Manage start path** - Define and navigate to the entry point
4. **Sync with browser navigation** - Keep state in sync with URL
5. **Track visited states** - Know which pages user has seen

## Basic Usage

### 1. Define state constants

```javascript
// puzzle.constants.js
export const STATE_INTRO = 'intro';
export const STATE_TUTORIAL = 'tutorial';
export const STATE_LEVEL1 = 'level1';
export const STATE_LEVEL2 = 'level2';
export const STATE_COMPLETE = 'complete';
```

### 2. Create state class (extends PageMachine)

```javascript
// puzzle.state.svelte.js
import { defineStateContext } from '@hkdigital/lib-core/state/context.js';
import PageMachine from '$lib/state/machines/PageMachine.svelte.js';
import PuzzleGameLogic from './puzzle.game-logic.svelte.js';
import {
  STATE_INTRO,
  STATE_TUTORIAL,
  STATE_LEVEL1,
  STATE_LEVEL2,
  STATE_COMPLETE
} from './puzzle.constants.js';

// Data keys for persistent data
const KEY_TUTORIAL_SEEN = 'tutorial-seen';
const KEY_HIGHEST_LEVEL = 'highest-level';
const KEY_DIFFICULTY = 'difficulty';

export class PuzzleState extends PageMachine {
  #gameLogic;

  constructor() {
    // Call PageMachine constructor with route config
    super({
      startPath: '/puzzle/intro',
      routeMap: {
        [STATE_INTRO]: '/puzzle/intro',
        [STATE_TUTORIAL]: '/puzzle/tutorial',
        [STATE_LEVEL1]: '/puzzle/level1',
        [STATE_LEVEL2]: '/puzzle/level2',
        [STATE_COMPLETE]: '/puzzle/complete'
      }
    });

    this.#gameLogic = new PuzzleGameLogic();
  }

  get gameLogic() {
    return this.#gameLogic;
  }

  // Computed properties for convenience
  get inIntro() {
    return this.current === STATE_INTRO;
  }

  get inTutorial() {
    return this.current === STATE_TUTORIAL;
  }

  get inLevel1() {
    return this.current === STATE_LEVEL1;
  }

  get inLevel2() {
    return this.current === STATE_LEVEL2;
  }

  get isComplete() {
    return this.current === STATE_COMPLETE;
  }

  // Persistent settings/progress (use getData/setData)
  get hasSeenTutorial() {
    return this.getData(KEY_TUTORIAL_SEEN) || false;
  }

  markTutorialComplete() {
    this.setData(KEY_TUTORIAL_SEEN, true);
  }

  get highestLevel() {
    return this.getData(KEY_HIGHEST_LEVEL) || 1;
  }

  updateHighestLevel(level) {
    const current = this.highestLevel;
    if (level > current) {
      this.setData(KEY_HIGHEST_LEVEL, level);
    }
  }

  get difficulty() {
    return this.getData(KEY_DIFFICULTY) || 'normal';
  }

  setDifficulty(level) {
    this.setData(KEY_DIFFICULTY, level);
  }

  // Optional: Lifecycle methods
  preload(onProgress) {
    return loadPuzzleAssets(onProgress);
  }

  reset() {
    this.#gameLogic = new PuzzleGameLogic();
  }
}

// Export context helpers
export const [createOrGetPuzzleState, createPuzzleState, getPuzzleState] =
  defineStateContext(PuzzleState);
```

### 3. Sync with route in +layout.svelte component

**This is IMPORTANT for url path to be connected to the page machine**

```svelte
<script>
  import { page } from '$app/stores';
  import { createOrGetPuzzleState } from '../puzzle.state.svelte.js';

  const puzzleState = createOrGetPuzzleState();

  // Sync state with URL changes
  $effect(() => {
    puzzleState.syncFromPath($page.url.pathname);
  });

  // Optional: Enforce that users must visit intro before playing
  $effect(() => {
    const currentPath = $page.url.pathname;

    if (!puzzleState.isStartPath(currentPath) &&
        currentPath.startsWith('/puzzle') &&
        !puzzleState.hasVisited('intro')) {
      puzzleState.redirectToStartPath();
    }
  });

  // Optional: Preload assets
  puzzleState.preload((progress) => {
    console.log('Loading:', progress);
  });
</script>

{#if puzzleState.inIntro}
  <IntroView onComplete={() => puzzleState.markTutorialComplete()} />
{:else if puzzleState.inTutorial}
  <TutorialView />
{:else if puzzleState.inLevel1}
  <Level1View gameLogic={puzzleState.gameLogic} />
{:else if puzzleState.inLevel2}
  <Level2View gameLogic={puzzleState.gameLogic} />
{:else if puzzleState.isComplete}
  <CompleteView
    score={puzzleState.gameLogic.score}
    highestLevel={puzzleState.highestLevel} />
{/if}
```

## Key Methods

All PageMachine methods are directly available on your state class:

```javascript
// Sync with URL path
puzzleState.syncFromPath(currentPath)

// Get current state
puzzleState.current

// Start path management
puzzleState.startPath                 // Get start path
puzzleState.startState                // Get start state
puzzleState.isStartPath(path)         // Check if path is start path
puzzleState.isOnStartState            // Check if on start state
puzzleState.redirectToStartPath()     // Navigate to start path

// Get route for state
puzzleState.getPathForState(stateName)

// Persistent data properties
puzzleState.setData(KEY_NAME, value)
puzzleState.getData(KEY_NAME)

// Visited states tracking
puzzleState.hasVisited(stateName)
puzzleState.getVisitedStates()

// Custom computed properties (from your class)
puzzleState.inIntro
puzzleState.inLevel1
puzzleState.hasSeenTutorial
```

## Data Storage Guidelines

### When to use `getData/setData` (PageMachine)

Use PageMachine's data properties for **persistent settings and progress**:

- ✅ Tutorial completion flags
- ✅ User preferences (difficulty, language, sound)
- ✅ Progress tracking (highest level reached)
- ✅ Settings that survive page navigation
- ✅ Data that might be saved to server

```javascript
const KEY_TUTORIAL_SEEN = 'tutorial-seen';
const KEY_DIFFICULTY = 'difficulty';
const KEY_HIGHEST_LEVEL = 'highest-level';

// Persistent data
pageMachine.setData(KEY_TUTORIAL_SEEN, true);
pageMachine.setData(KEY_DIFFICULTY, 'hard');
pageMachine.setData(KEY_HIGHEST_LEVEL, 5);
```

### When to use GameLogic with `$state`

Use a separate GameLogic class with `$state` fields for **reactive game state**:

- ✅ Live scores, lives, health
- ✅ Current player, selected items
- ✅ Complex objects (cards, inventory, enemies)
- ✅ Temporary turn/round state
- ✅ Reactive UI state that changes frequently

```javascript
// puzzle.game-logic.svelte.js
export class PuzzleGameLogic {
  #score = $state(0);
  #lives = $state(3);
  #selectedCards = $state([]);
  #currentPuzzle = $state(null);

  get score() { return this.#score; }
  incrementScore(points) { this.#score += points; }
}
```

## Important Notes

- Not a finite state machine - allows free navigation
- States map 1:1 with routes
- Use state constants instead of magic strings
- Always sync in `$effect` watching `$page.url.pathname`
- Use constants for data keys (e.g., `KEY_TUTORIAL_SEEN = 'tutorial-seen'`)
- Separate persistent data (PageMachine) from reactive game state (GameLogic)
