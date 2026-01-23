# PageMachine

Route-aware data manager for tracking navigation and managing business data
within a route group.

## How it connects

```
┌─────────────────────────────────────────────────────────┐
│ PuzzleState (extends PageMachine)                       │
│ - Tracks current route within a route group             │
│ - Manages business/domain data                          │
│ - Tracks visited routes                                 │
│ - Provides computed properties (isOnIntro, etc.)        │
│ - Contains GameLogic for reactive game state            │
│ - Optional: services, preload, reset, etc.              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Context provided to layout
                 │
┌────────────────▼────────────────────────────────────────┐
│ +layout.svelte                                          │
│ IMPORTANT: Must sync URL with machine:                  │
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
  Access via: puzzleState.current, puzzleState.isOnIntro, etc.
```

## Main Purposes

1. **Track current route** - Which page is active
2. **Sync with browser navigation** - Keep state in sync with URL
3. **Manage business data** - Persistent settings and progress
4. **Track visited routes** - Know which pages user has seen
5. **Manage start path** - Define and navigate to the entry point

## Basic Usage

### 1. Define route constants

```javascript
// puzzle.routes.js
export const ROUTE_INTRO = '/puzzle/intro';
export const ROUTE_TUTORIAL = '/puzzle/tutorial';
export const ROUTE_LEVEL1 = '/puzzle/level1';
export const ROUTE_LEVEL2 = '/puzzle/level2';
export const ROUTE_COMPLETE = '/puzzle/complete';
```

### 2. Create state class (extends PageMachine)

```javascript
// puzzle.state.svelte.js
import { defineStateContext } from '@hkdigital/lib-core/state/context.js';
import PageMachine from '$lib/state/machines/PageMachine.svelte.js';
import PuzzleGameLogic from './puzzle.game-logic.svelte.js';
import {
  ROUTE_INTRO,
  ROUTE_TUTORIAL,
  ROUTE_LEVEL1,
  ROUTE_LEVEL2,
  ROUTE_COMPLETE
} from './puzzle.routes.js';

// Data keys for persistent data
const KEY_TUTORIAL_SEEN = 'tutorial-seen';
const KEY_HIGHEST_LEVEL = 'highest-level';
const KEY_DIFFICULTY = 'difficulty';

// Dev data keys (use KEY_DEV_ prefix)
const KEY_DEV_AUTO_NAVIGATION = 'dev-auto-navigation';
const KEY_DEV_SKIP_ANIMATIONS = 'dev-skip-animations';

export class PuzzleState extends PageMachine {
  #logic;

  constructor() {
    // Call PageMachine constructor with route config
    super({
      startPath: ROUTE_INTRO,
      routes: [
        ROUTE_INTRO,
        ROUTE_TUTORIAL,
        ROUTE_LEVEL1,
        ROUTE_LEVEL2,
        ROUTE_COMPLETE
      ],
      initialData: {
        [KEY_TUTORIAL_SEEN]: false,
        [KEY_HIGHEST_LEVEL]: 1,
        [KEY_DIFFICULTY]: 'normal'
      },
      initialDevData: {
        [KEY_DEV_AUTO_NAVIGATION]: false,
        [KEY_DEV_SKIP_ANIMATIONS]: false
      }
    });

    this.#logic = new PuzzleGameLogic();
  }

  get logic() {
    return this.#logic;
  }

  // Computed properties for convenience
  get isOnIntro() {
    return this.current === ROUTE_INTRO;
  }

  get isOnTutorial() {
    return this.current === ROUTE_TUTORIAL;
  }

  get isOnLevel1() {
    return this.current === ROUTE_LEVEL1;
  }

  get isOnLevel2() {
    return this.current === ROUTE_LEVEL2;
  }

  get isComplete() {
    return this.current === ROUTE_COMPLETE;
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
    this.#logic = new PuzzleGameLogic();
  }
}

// Export context helpers
export const [createOrGetPuzzleState, createPuzzleState, getPuzzleState] =
  defineStateContext(PuzzleState);
```

### 3. Sync with route in +layout.svelte component

**This is IMPORTANT for URL path to be connected to the page machine**

```svelte
<script>
  import { page } from '$app/stores';
  import { createOrGetPuzzleState } from '../puzzle.state.svelte.js';
  import { ROUTE_INTRO } from '../puzzle.routes.js';

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
        !puzzleState.hasVisited(ROUTE_INTRO)) {
      puzzleState.redirectToStartPath();
    }
  });

  // Optional: Preload assets
  puzzleState.preload((progress) => {
    console.log('Loading:', progress);
  });
</script>

{#if puzzleState.isOnIntro}
  <IntroView onComplete={() => puzzleState.markTutorialComplete()} />
{:else if puzzleState.isOnTutorial}
  <TutorialView />
{:else if puzzleState.isOnLevel1}
  <Level1View gameLogic={puzzleState.logic} />
{:else if puzzleState.isOnLevel2}
  <Level2View gameLogic={puzzleState.logic} />
{:else if puzzleState.isComplete}
  <CompleteView
    score={puzzleState.logic.score}
    highestLevel={puzzleState.highestLevel} />
{/if}
```

## Animations and Page-Specific Logic

For page-specific animations or initialization, use `$effect` in your
`+page.svelte` files rather than centralized hooks:

```javascript
// +page.svelte
<script>
  import { PageAnimations } from './animations.svelte.js';

  const animations = new PageAnimations();

  // Trigger animations when conditions are met
  $effect(() => {
    if (someCondition) {
      animations.start();
    }
  });

  // Or use onMount for one-time initialization
  onMount(() => {
    animations.initialize();
  });
</script>
```

This approach keeps animation logic co-located with the components that
render them, making it easier to understand and maintain.

## Key Methods

All PageMachine methods are directly available on your state class:

```javascript
// Sync with URL path
puzzleState.syncFromPath(currentPath)

// Get current route
puzzleState.current  // e.g., '/puzzle/level1'

// Start path management
puzzleState.startPath                 // Get start path
puzzleState.isStartPath(path)         // Check if path is start path
puzzleState.isOnStartPath             // Check if on start path
puzzleState.redirectToStartPath()     // Navigate to start path

// Persistent data properties
puzzleState.setData(KEY_NAME, value)
puzzleState.getData(KEY_NAME)
puzzleState.getAllData()
puzzleState.updateData({ KEY1: val1, KEY2: val2 })

// Visited routes tracking
puzzleState.hasVisited(route)         // e.g., hasVisited('/puzzle/intro')
puzzleState.hasVisitedStart           // Has visited start path
puzzleState.getVisitedRoutes()
puzzleState.resetVisitedRoutes()

// Get routes list
puzzleState.routes                    // Array of all routes

// Custom computed properties (from your class)
puzzleState.isOnIntro
puzzleState.isOnLevel1
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

**IMPORTANT**: Use KEY_ constants for data keys to get:
- ✅ Autocomplete support
- ✅ Typo prevention
- ✅ Easy refactoring
- ✅ Self-documenting code

```javascript
// Define constants (at top of file)
const KEY_TUTORIAL_SEEN = 'tutorial-seen';
const KEY_DIFFICULTY = 'difficulty';
const KEY_HIGHEST_LEVEL = 'highest-level';

// Use constants (not strings!)
pageMachine.setData(KEY_TUTORIAL_SEEN, true);       // ✅ Good
pageMachine.setData(KEY_DIFFICULTY, 'hard');        // ✅ Good
pageMachine.setData(KEY_HIGHEST_LEVEL, 5);          // ✅ Good

// DON'T use magic strings
pageMachine.setData('tutorial-seen', true);         // ❌ Avoid
pageMachine.setData('TUTORIAL_SEEN', true);         // ❌ Avoid
```

### When to use GameLogic with `$state`

Use a separate GameLogic class with `$state` fields for
**reactive game state**:

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

- Does not enforce transitions - allows free navigation via browser
- Routes are the source of truth (no state abstraction layer)
- Use route constants for clarity and maintainability
- Always sync in `$effect` watching `$page.url.pathname`
- Use constants for data keys (e.g., `KEY_TUTORIAL_SEEN`)
- Separate persistent data (PageMachine) from reactive state (GameLogic)
- Handle animations in pages using `$effect` or `onMount`
